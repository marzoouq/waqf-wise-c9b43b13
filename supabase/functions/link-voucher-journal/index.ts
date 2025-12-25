import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

/**
 * link-voucher-journal
 * ربط سندات الصرف بالقيود المحاسبية
 * عند إنشاء سند صرف → إنشاء قيد محاسبي تلقائي
 */

interface VoucherJournalRequest {
  voucher_id: string;
  create_journal?: boolean; // إنشاء قيد جديد
  journal_entry_id?: string; // ربط بقيد موجود
}

// حسابات افتراضية لسندات الصرف
const DEFAULT_ACCOUNTS = {
  cash: '1.1.1',      // النقدية والبنوك
  beneficiary: '2.1', // الخصوم المتداولة (مستحقات المستفيدين)
};

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support
    const bodyClone = await req.clone().text();
    if (bodyClone) {
      try {
        const parsed = JSON.parse(bodyClone);
        if (parsed.ping || parsed.healthCheck) {
          console.log('[link-voucher-journal] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'link-voucher-journal',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }

    // 🔐 التحقق من المصادقة
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[link-voucher-journal] ❌ No authorization header');
      return errorResponse('غير مصرح - يجب تسجيل الدخول', 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 🔐 التحقق من صحة التوكن
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[link-voucher-journal] ❌ Invalid token:', authError);
      return errorResponse('رمز المصادقة غير صحيح', 401);
    }

    // 🔐 التحقق من الصلاحيات
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAccess = roles?.some(r => ['admin', 'nazer', 'accountant', 'cashier'].includes(r.role));
    if (!hasAccess) {
      console.error('[link-voucher-journal] ❌ Unauthorized:', { userId: user.id });
      return errorResponse('ليس لديك صلاحية للوصول لهذه الخدمة', 403);
    }

    console.log('[link-voucher-journal] ✅ Authorized:', { userId: user.id });

    const { voucher_id, create_journal, journal_entry_id }: VoucherJournalRequest = await req.json();

    if (!voucher_id) {
      return errorResponse('يجب تحديد رقم سند الصرف', 400);
    }

    // جلب بيانات سند الصرف
    const { data: voucher, error: voucherError } = await supabase
      .from('payment_vouchers')
      .select(`
        *,
        beneficiaries:beneficiary_id (id, full_name)
      `)
      .eq('id', voucher_id)
      .single();

    if (voucherError || !voucher) {
      console.error('[link-voucher-journal] ❌ Voucher not found:', voucherError);
      return errorResponse('سند الصرف غير موجود', 404);
    }

    // إذا كان السند مرتبط بقيد بالفعل
    if (voucher.journal_entry_id && !create_journal && !journal_entry_id) {
      return jsonResponse({
        success: true,
        message: 'سند الصرف مرتبط بقيد محاسبي بالفعل',
        journal_entry_id: voucher.journal_entry_id,
      });
    }

    let linkedJournalId = journal_entry_id;

    // إنشاء قيد جديد إذا طُلب ذلك
    if (create_journal) {
      console.log('[link-voucher-journal] 📝 Creating new journal entry for voucher:', voucher.voucher_number);

      // جلب السنة المالية النشطة
      const { data: fiscalYear } = await supabase
        .from('fiscal_years')
        .select('id')
        .eq('is_active', true)
        .single();

      if (!fiscalYear) {
        return errorResponse('لا توجد سنة مالية نشطة', 400);
      }

      // جلب الحسابات
      const { data: cashAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('code', DEFAULT_ACCOUNTS.cash)
        .single();

      const { data: liabilityAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('code', DEFAULT_ACCOUNTS.beneficiary)
        .single();

      if (!cashAccount || !liabilityAccount) {
        return errorResponse('لم يتم العثور على الحسابات المطلوبة', 400);
      }

      // إنشاء رقم القيد
      const { data: lastEntry } = await supabase
        .from('journal_entries')
        .select('entry_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const lastNumber = lastEntry?.entry_number 
        ? parseInt(lastEntry.entry_number.split('-')[1], 10) 
        : 0;
      const newEntryNumber = `JE-${(lastNumber + 1).toString().padStart(6, '0')}`;

      const beneficiaryName = voucher.beneficiaries?.full_name || 'مستفيد';

      // إنشاء القيد
      const { data: journalEntry, error: entryError } = await supabase
        .from('journal_entries')
        .insert({
          entry_number: newEntryNumber,
          entry_date: new Date().toISOString().split('T')[0],
          description: `سند صرف رقم ${voucher.voucher_number} - ${beneficiaryName}`,
          status: 'draft',
          fiscal_year_id: fiscalYear.id,
          reference_type: 'payment_voucher',
          reference_id: voucher_id,
        })
        .select()
        .single();

      if (entryError) {
        console.error('[link-voucher-journal] ❌ Entry creation error:', entryError);
        throw entryError;
      }

      // إنشاء سطور القيد
      // مدين: الخصوم (تخفيض المستحقات)
      // دائن: النقدية (خروج النقد)
      const journalLines = [
        {
          journal_entry_id: journalEntry.id,
          account_id: liabilityAccount.id,
          line_number: 1,
          description: `صرف لـ ${beneficiaryName}`,
          debit_amount: voucher.amount,
          credit_amount: 0,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: cashAccount.id,
          line_number: 2,
          description: `صرف نقدي - سند ${voucher.voucher_number}`,
          debit_amount: 0,
          credit_amount: voucher.amount,
        },
      ];

      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(journalLines);

      if (linesError) {
        console.error('[link-voucher-journal] ❌ Lines creation error:', linesError);
        throw linesError;
      }

      linkedJournalId = journalEntry.id;

      console.log('[link-voucher-journal] ✅ Journal entry created:', newEntryNumber);

      // تسجيل في auto_journal_log
      await supabase.from('auto_journal_log').insert({
        journal_entry_id: journalEntry.id,
        trigger_event: 'payment_voucher_created',
        reference_id: voucher_id,
        reference_type: 'payment_voucher',
        amount: voucher.amount,
        success: true,
        metadata: { voucher_number: voucher.voucher_number },
      });
    }

    // ربط السند بالقيد
    if (linkedJournalId) {
      const { error: updateError } = await supabase
        .from('payment_vouchers')
        .update({ 
          journal_entry_id: linkedJournalId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', voucher_id);

      if (updateError) {
        console.error('[link-voucher-journal] ❌ Update error:', updateError);
        throw updateError;
      }

      console.log('[link-voucher-journal] ✅ Voucher linked to journal:', linkedJournalId);
    }

    // تسجيل في audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email,
      action_type: 'VOUCHER_JOURNAL_LINKED',
      table_name: 'payment_vouchers',
      record_id: voucher_id,
      severity: 'info',
      description: `تم ربط سند الصرف ${voucher.voucher_number} بقيد محاسبي`,
      new_values: { 
        voucher_id, 
        journal_entry_id: linkedJournalId,
        amount: voucher.amount,
      },
    });

    return jsonResponse({
      success: true,
      voucher_id,
      journal_entry_id: linkedJournalId,
      message: create_journal 
        ? 'تم إنشاء قيد محاسبي وربطه بسند الصرف بنجاح'
        : 'تم ربط سند الصرف بالقيد المحاسبي بنجاح',
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[link-voucher-journal] ❌ Error:', error);
    return errorResponse(errorMessage);
  }
});
