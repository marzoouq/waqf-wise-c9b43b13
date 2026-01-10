import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  handleCors, 
  jsonResponse, 
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse
} from '../_shared/cors.ts';

interface ZATCASubmitRequest {
  invoice_id: string;
  submission_type: 'reporting' | 'clearance';
}

interface Invoice {
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  vat_number: string;
  total_amount: number;
  tax_amount: number;
  zatca_uuid?: string;
  invoice_lines?: unknown[];
}

// الأدوار المسموح لها بإرسال الفواتير لـ ZATCA
const ALLOWED_ROLES = ['admin', 'nazer', 'accountant'];

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ قراءة body مرة واحدة فقط
    const bodyText = await req.text();
    let bodyData: Record<string, unknown> = {};
    
    if (bodyText) {
      try {
        bodyData = JSON.parse(bodyText);
      } catch {
        return errorResponse('Invalid JSON body', 400);
      }
    }

    // ✅ Health Check Support
    if (bodyData.ping || bodyData.healthCheck || bodyData.testMode) {
      console.log('[zatca-submit] Health check / test mode received');
      return jsonResponse({
        status: 'healthy',
        function: 'zatca-submit',
        testMode: !!bodyData.testMode,
        message: bodyData.testMode ? 'اختبار ناجح - لم يتم إرسال فعلي لزاتكا' : undefined,
        timestamp: new Date().toISOString()
      });
    }

    // ============ التحقق من المصادقة والصلاحيات ============
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('ZATCA submission attempt without authorization header');
      return unauthorizedResponse('مطلوب تسجيل الدخول لإرسال الفواتير');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // التحقق من صحة التوكن
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('ZATCA submission: Invalid or expired token');
      return unauthorizedResponse('جلسة منتهية - يرجى إعادة تسجيل الدخول');
    }

    // التحقق من صلاحيات المستخدم
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasPermission = roles?.some(r => ALLOWED_ROLES.includes(r.role));
    
    if (!hasPermission) {
      console.warn('ZATCA submission: Unauthorized role attempt by:', user.id);
      return forbiddenResponse('ليس لديك صلاحية إرسال الفواتير لهيئة الزكاة والضريبة');
    }

    // ============ استخدام bodyData المحفوظة ============
    const invoice_id = bodyData.invoice_id as string | undefined;
    const submission_type = (bodyData.submission_type as 'reporting' | 'clearance') || 'reporting';

    if (!invoice_id) {
      return errorResponse('معرف الفاتورة مطلوب', 400);
    }

    // جلب الفاتورة
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, invoice_lines(*)')
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      return errorResponse('لم يتم العثور على الفاتورة', 404);
    }

    // التحقق من اكتمال البيانات
    if (!invoice.vat_number) {
      throw new Error('الرقم الضريبي مطلوب');
    }

    // Cast to typed invoice
    const typedInvoice = invoice as Invoice;

    // إنشاء رمز QR
    const qrData = generateQRData(typedInvoice);

    // إنشاء Hash للفاتورة
    const invoiceHash = await generateInvoiceHash(typedInvoice);

    // إنشاء XML حسب معيار ZATCA
    const invoiceXML = generateInvoiceXML(typedInvoice, qrData, invoiceHash);

    // محاكاة الإرسال للهيئة (في الواقع يحتاج API key من ZATCA)
    // هذا مثال تجريبي فقط
    const simulatedResponse = {
      success: true,
      invoice_uuid: typedInvoice.zatca_uuid,
      clearance_status: 'CLEARED',
      warnings: [],
    };

    // تحديث الفاتورة
    await supabase
      .from('invoices')
      .update({
        zatca_qr_data: qrData,
        zatca_hash: invoiceHash,
        is_zatca_compliant: true,
        zatca_status: 'submitted',
        zatca_submitted_at: new Date().toISOString(),
      })
      .eq('id', invoice_id);

    // تسجيل في log
    await supabase.from('zatca_submission_log').insert({
      invoice_id,
      submission_type,
      request_payload: { xml: invoiceXML },
      response_payload: simulatedResponse,
      status: 'success',
    });

    return jsonResponse({
      success: true,
      qr_data: qrData,
      invoice_hash: invoiceHash,
      zatca_response: simulatedResponse,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error submitting to ZATCA:', error);
    return errorResponse(errorMessage, 400);
  }
});

function generateQRData(invoice: Invoice): string {
  // TLV encoding for ZATCA QR
  const data = [
    { tag: 1, value: invoice.customer_name },
    { tag: 2, value: invoice.vat_number },
    { tag: 3, value: invoice.invoice_date },
    { tag: 4, value: invoice.total_amount.toFixed(2) },
    { tag: 5, value: invoice.tax_amount.toFixed(2) },
  ];

  let tlv = '';
  data.forEach(({ tag, value }) => {
    const valueBytes = new TextEncoder().encode(value);
    tlv += String.fromCharCode(tag) + String.fromCharCode(valueBytes.length) + value;
  });

  return btoa(tlv);
}

async function generateInvoiceHash(invoice: Invoice): Promise<string> {
  const hashInput = `${invoice.invoice_number}|${invoice.invoice_date}|${invoice.total_amount}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(hashInput);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateInvoiceXML(invoice: Invoice, qrData: string, hash: string): string {
  // تبسيط - في الواقع يحتاج XML كامل حسب معيار UBL 2.1
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <ID>${invoice.invoice_number}</ID>
  <IssueDate>${invoice.invoice_date}</IssueDate>
  <InvoiceTypeCode>388</InvoiceTypeCode>
  <DocumentCurrencyCode>SAR</DocumentCurrencyCode>
  <TaxTotal>
    <TaxAmount>${invoice.tax_amount}</TaxAmount>
  </TaxTotal>
  <LegalMonetaryTotal>
    <TaxInclusiveAmount>${invoice.total_amount}</TaxInclusiveAmount>
  </LegalMonetaryTotal>
  <QRCode>${qrData}</QRCode>
  <Hash>${hash}</Hash>
</Invoice>`;
}
