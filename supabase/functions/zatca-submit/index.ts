import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ZATCASubmitRequest {
  invoice_id: string;
  submission_type: 'reporting' | 'clearance';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { invoice_id, submission_type }: ZATCASubmitRequest = await req.json();

    // جلب الفاتورة
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, invoice_lines(*)')
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('لم يتم العثور على الفاتورة');
    }

    // التحقق من اكتمال البيانات
    if (!invoice.vat_number) {
      throw new Error('الرقم الضريبي مطلوب');
    }

    // إنشاء رمز QR
    const qrData = generateQRData(invoice);

    // إنشاء Hash للفاتورة
    const invoiceHash = await generateInvoiceHash(invoice);

    // إنشاء XML حسب معيار ZATCA
    const invoiceXML = generateInvoiceXML(invoice, qrData, invoiceHash);

    // محاكاة الإرسال للهيئة (في الواقع يحتاج API key من ZATCA)
    // هذا مثال تجريبي فقط
    const simulatedResponse = {
      success: true,
      invoice_uuid: invoice.zatca_uuid,
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

    return new Response(
      JSON.stringify({
        success: true,
        qr_data: qrData,
        invoice_hash: invoiceHash,
        zatca_response: simulatedResponse,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error submitting to ZATCA:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function generateQRData(invoice: any): string {
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

async function generateInvoiceHash(invoice: any): Promise<string> {
  const hashInput = `${invoice.invoice_number}|${invoice.invoice_date}|${invoice.total_amount}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(hashInput);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateInvoiceXML(invoice: any, qrData: string, hash: string): string {
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
