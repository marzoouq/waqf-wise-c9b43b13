import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

interface ProcessedPayment {
  payment_number: string;
  invoice_id: string;
  receipt_id: string;
  journal_entry_id: string;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support - يجب أن يكون قبل التحقق من Authorization
    try {
      const bodyClone = await req.clone().text();
      if (bodyClone) {
        const parsed = JSON.parse(bodyClone);
        if (parsed.ping || parsed.healthCheck || parsed.test) {
          console.log('[backfill-rental-documents] Health check / test mode received');
          return jsonResponse({
            status: 'healthy',
            function: 'backfill-rental-documents',
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch {
      // ليس JSON، متابعة
    }

    // 1. التحقق من المصادقة والصلاحيات
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return unauthorizedResponse('Missing authorization header');
    }

    // استخدام Service Role للتحقق من الهوية والصلاحيات
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return unauthorizedResponse('Unauthorized');
    }

    // 2. التحقق من دور admin أو accountant
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('Error checking user role:', roleError);
      return errorResponse('Error verifying permissions', 500);
    }

    const userRoles = roleData?.map(r => r.role) || [];
    const hasRequiredRole = userRoles.some(role => ['admin', 'accountant'].includes(role));

    if (!hasRequiredRole) {
      console.warn('Unauthorized backfill attempt by:', user.id, 'with roles:', userRoles);
      return forbiddenResponse('Forbidden: Admin or Accountant role required');
    }

    console.log('🔍 جاري البحث عن الدفعات المدفوعة بدون فواتير...');

    // 1️⃣ جلب الدفعات المدفوعة فقط بدون فواتير
    const { data: paidPayments, error: fetchError } = await supabaseClient
      .from('rental_payments')
      .select(`
        *,
        contracts!inner (
          contract_number,
          tenant_name,
          tenant_id_number,
          tenant_email,
          tenant_phone,
          properties!inner (
            name
          )
        )
      `)
      .eq('status', 'مدفوع')
      .gt('amount_paid', 0)
      .is('invoice_id', null);

    if (fetchError) throw fetchError;

    console.log(`✅ تم العثور على ${paidPayments?.length || 0} دفعات مدفوعة`);

    if (!paidPayments || paidPayments.length === 0) {
      return jsonResponse({ 
        success: true, 
        message: 'لا توجد دفعات تحتاج معالجة',
        processed: 0 
      });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const processedPayments: ProcessedPayment[] = [];

    // 2️⃣ معالجة كل دفعة
    for (const payment of paidPayments) {
      try {
        console.log(`📝 معالجة الدفعة: ${payment.payment_number}`);

        // استدعاء create_rental_invoice_and_receipt
        const { data: rpcResult, error: rpcError } = await supabaseClient.rpc(
          'create_rental_invoice_and_receipt',
          {
            p_rental_payment_id: payment.id,
            p_contract_id: payment.contract_id,
            p_amount: payment.amount_paid,
            p_payment_date: payment.payment_date,
            p_payment_method: payment.payment_method || 'نقدي',
            p_tenant_name: payment.contracts.tenant_name,
            p_tenant_id: payment.contracts.tenant_id_number,
            p_tenant_email: payment.contracts.tenant_email || null,
            p_tenant_phone: payment.contracts.tenant_phone,
            p_property_name: payment.contracts.properties.name
          }
        );

        if (rpcError) {
          console.error(`❌ خطأ في RPC للدفعة ${payment.payment_number}:`, rpcError);
          errors.push(`${payment.payment_number}: ${rpcError.message}`);
          failedCount++;
          continue;
        }

        if (!rpcResult || !rpcResult[0]?.success) {
          console.error(`❌ فشل إنشاء المستندات للدفعة ${payment.payment_number}`);
          errors.push(`${payment.payment_number}: ${rpcResult?.[0]?.message || 'فشل غير معروف'}`);
          failedCount++;
          continue;
        }

        console.log(`✅ تم إنشاء المستندات للدفعة ${payment.payment_number}`);
        console.log(`   - Invoice ID: ${rpcResult[0].invoice_id}`);
        console.log(`   - Receipt ID: ${rpcResult[0].receipt_id}`);
        console.log(`   - Journal Entry ID: ${rpcResult[0].journal_entry_id}`);

        processedPayments.push({
          payment_number: payment.payment_number,
          invoice_id: rpcResult[0].invoice_id,
          receipt_id: rpcResult[0].receipt_id,
          journal_entry_id: rpcResult[0].journal_entry_id
        });

        successCount++;

      } catch (error) {
        console.error(`❌ خطأ عام في معالجة ${payment.payment_number}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
        errors.push(`${payment.payment_number}: ${errorMessage}`);
        failedCount++;
      }
    }

    // 3️⃣ حذف القيود الخاطئة (المرتبطة بدفعات معلقة)
    console.log('🧹 تنظيف القيود المحاسبية الخاطئة...');
    
    const { data: wrongEntries } = await supabaseClient
      .from('journal_entries')
      .select('id')
      .eq('reference_type', 'rental_payment')
      .in('reference_id', 
        await supabaseClient
          .from('rental_payments')
          .select('id')
          .neq('status', 'مدفوع')
          .then(({ data }) => data?.map(p => p.id) || [])
      );

    if (wrongEntries && wrongEntries.length > 0) {
      const wrongEntryIds = wrongEntries.map(e => e.id);
      
      // حذف السطور أولاً
      await supabaseClient
        .from('journal_entry_lines')
        .delete()
        .in('journal_entry_id', wrongEntryIds);
      
      // ثم حذف القيود
      await supabaseClient
        .from('journal_entries')
        .delete()
        .in('id', wrongEntryIds);
      
      console.log(`✅ تم حذف ${wrongEntries.length} قيد خاطئ`);
    }

    // 4️⃣ النتيجة النهائية
    const result = {
      success: true,
      total: paidPayments.length,
      processed: successCount,
      failed: failedCount,
      cleaned_entries: wrongEntries?.length || 0,
      errors: errors.length > 0 ? errors : undefined,
      processed_payments: processedPayments,
      message: `تمت معالجة ${successCount} من ${paidPayments.length} دفعة بنجاح${wrongEntries?.length ? ` وتنظيف ${wrongEntries.length} قيد خاطئ` : ''}`
    };

    console.log('📊 النتيجة النهائية:', result);

    return jsonResponse(result);

  } catch (error) {
    console.error('❌ خطأ حرج في Edge Function:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'خطأ غير معروف',
      500,
      error instanceof Error ? error.stack : undefined
    );
  }
});
