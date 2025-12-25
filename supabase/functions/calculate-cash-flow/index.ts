import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

/**
 * calculate-cash-flow
 * حساب التدفقات النقدية تلقائياً من القيود المحاسبية
 * تصنيف: تشغيلية، استثمارية، تمويلية
 */

interface CashFlowResult {
  fiscal_year_id: string;
  period_start: string;
  period_end: string;
  operating_activities: number;
  investing_activities: number;
  financing_activities: number;
  net_cash_flow: number;
  opening_cash: number;
  closing_cash: number;
}

// تصنيف الحسابات حسب نوع النشاط
const ACCOUNT_CLASSIFICATIONS = {
  // أنشطة تشغيلية - إيرادات ومصروفات التشغيل
  operating: ['4', '4.1', '4.1.1', '5', '5.1', '5.1.5', '5.4', '5.4.5'],
  // أنشطة استثمارية - الأصول الثابتة
  investing: ['1.2', '1.2.1'],
  // أنشطة تمويلية - حقوق الملكية والخصوم طويلة الأجل
  financing: ['2', '2.1', '2.1.3', '3', '3.1', '3.1.1'],
  // حسابات النقدية
  cash: ['1.1.1'],
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
          console.log('[calculate-cash-flow] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'calculate-cash-flow',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }

    // 🔐 التحقق من المصادقة
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[calculate-cash-flow] ❌ No authorization header');
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
      console.error('[calculate-cash-flow] ❌ Invalid token:', authError);
      return errorResponse('رمز المصادقة غير صحيح', 401);
    }

    // 🔐 التحقق من الصلاحيات
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAccess = roles?.some(r => ['admin', 'nazer', 'accountant'].includes(r.role));
    if (!hasAccess) {
      console.error('[calculate-cash-flow] ❌ Unauthorized:', { userId: user.id });
      return errorResponse('ليس لديك صلاحية للوصول لهذه الخدمة', 403);
    }

    console.log('[calculate-cash-flow] ✅ Authorized:', { userId: user.id });

    const { fiscal_year_id, period_start, period_end } = await req.json();

    // جلب السنة المالية
    let targetFiscalYear = fiscal_year_id;
    if (!targetFiscalYear) {
      const { data: activeFY } = await supabase
        .from('fiscal_years')
        .select('id, start_date, end_date')
        .eq('is_active', true)
        .single();

      if (!activeFY) {
        throw new Error('لم يتم العثور على سنة مالية نشطة');
      }
      targetFiscalYear = activeFY.id;
    }

    // جلب السنة المالية للحصول على التواريخ
    const { data: fiscalYear } = await supabase
      .from('fiscal_years')
      .select('*')
      .eq('id', targetFiscalYear)
      .single();

    if (!fiscalYear) {
      throw new Error('السنة المالية غير موجودة');
    }

    const startDate = period_start || fiscalYear.start_date;
    const endDate = period_end || fiscalYear.end_date;

    console.log('[calculate-cash-flow] 📅 Period:', { startDate, endDate });

    // جلب جميع الحسابات مع أكوادها
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id, code, name_ar, account_type');

    if (!accounts) {
      throw new Error('لم يتم العثور على حسابات');
    }

    // إنشاء خريطة الحسابات
    const accountMap = new Map(accounts.map(a => [a.id, a]));

    // جلب القيود المرحّلة في الفترة المحددة
    const { data: journalEntries } = await supabase
      .from('journal_entries')
      .select('id, entry_date')
      .eq('fiscal_year_id', targetFiscalYear)
      .eq('status', 'posted')
      .gte('entry_date', startDate)
      .lte('entry_date', endDate);

    if (!journalEntries || journalEntries.length === 0) {
      console.log('[calculate-cash-flow] ⚠️ No posted entries found');
      return jsonResponse({
        success: true,
        message: 'لا توجد قيود مرحّلة في الفترة المحددة',
        data: {
          fiscal_year_id: targetFiscalYear,
          period_start: startDate,
          period_end: endDate,
          operating_activities: 0,
          investing_activities: 0,
          financing_activities: 0,
          net_cash_flow: 0,
          opening_cash: 0,
          closing_cash: 0,
        }
      });
    }

    const entryIds = journalEntries.map(e => e.id);

    // جلب سطور القيود
    const { data: journalLines } = await supabase
      .from('journal_entry_lines')
      .select('*')
      .in('journal_entry_id', entryIds);

    if (!journalLines) {
      throw new Error('لم يتم العثور على سطور القيود');
    }

    // تصنيف التدفقات
    let operatingActivities = 0;
    let investingActivities = 0;
    let financingActivities = 0;
    let cashInflow = 0;
    let cashOutflow = 0;

    for (const line of journalLines) {
      const account = accountMap.get(line.account_id);
      if (!account) continue;

      const code = account.code;
      const netAmount = (line.debit_amount || 0) - (line.credit_amount || 0);

      // تصنيف حسب كود الحساب
      if (ACCOUNT_CLASSIFICATIONS.cash.some(c => code.startsWith(c))) {
        // حركات النقدية
        if (netAmount > 0) {
          cashInflow += netAmount;
        } else {
          cashOutflow += Math.abs(netAmount);
        }
      } else if (ACCOUNT_CLASSIFICATIONS.operating.some(c => code.startsWith(c))) {
        // أنشطة تشغيلية
        if (account.account_type === 'revenue') {
          operatingActivities += (line.credit_amount || 0) - (line.debit_amount || 0);
        } else if (account.account_type === 'expense') {
          operatingActivities -= (line.debit_amount || 0) - (line.credit_amount || 0);
        }
      } else if (ACCOUNT_CLASSIFICATIONS.investing.some(c => code.startsWith(c))) {
        // أنشطة استثمارية
        investingActivities -= netAmount; // سالب = شراء أصول
      } else if (ACCOUNT_CLASSIFICATIONS.financing.some(c => code.startsWith(c))) {
        // أنشطة تمويلية
        financingActivities += netAmount;
      }
    }

    const netCashFlow = operatingActivities + investingActivities + financingActivities;

    // جلب رصيد النقدية الافتتاحي
    const { data: openingBalances } = await supabase
      .from('accounts')
      .select('current_balance')
      .in('code', ACCOUNT_CLASSIFICATIONS.cash);

    const openingCash = openingBalances?.reduce((sum, a) => sum + (a.current_balance || 0), 0) || 0;
    const closingCash = openingCash + netCashFlow;

    const result: CashFlowResult = {
      fiscal_year_id: targetFiscalYear,
      period_start: startDate,
      period_end: endDate,
      operating_activities: Math.round(operatingActivities * 100) / 100,
      investing_activities: Math.round(investingActivities * 100) / 100,
      financing_activities: Math.round(financingActivities * 100) / 100,
      net_cash_flow: Math.round(netCashFlow * 100) / 100,
      opening_cash: Math.round(openingCash * 100) / 100,
      closing_cash: Math.round(closingCash * 100) / 100,
    };

    console.log('[calculate-cash-flow] 📊 Result:', result);

    // حفظ أو تحديث في جدول cash_flows
    const { data: existingFlow } = await supabase
      .from('cash_flows')
      .select('id')
      .eq('fiscal_year_id', targetFiscalYear)
      .eq('period_start', startDate)
      .eq('period_end', endDate)
      .maybeSingle();

    if (existingFlow) {
      // تحديث
      await supabase
        .from('cash_flows')
        .update({
          ...result,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingFlow.id);

      console.log('[calculate-cash-flow] ✅ Updated existing cash flow:', existingFlow.id);
    } else {
      // إنشاء جديد
      const { data: newFlow, error: insertError } = await supabase
        .from('cash_flows')
        .insert(result)
        .select()
        .single();

      if (insertError) {
        console.error('[calculate-cash-flow] ❌ Insert error:', insertError);
        throw insertError;
      }

      console.log('[calculate-cash-flow] ✅ Created new cash flow:', newFlow?.id);
    }

    // تسجيل في audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email,
      action_type: 'CASH_FLOW_CALCULATED',
      table_name: 'cash_flows',
      severity: 'info',
      description: `تم حساب التدفقات النقدية للفترة ${startDate} إلى ${endDate}`,
      new_values: result,
    });

    return jsonResponse({
      success: true,
      data: result,
      summary: {
        operating: result.operating_activities,
        investing: result.investing_activities,
        financing: result.financing_activities,
        net: result.net_cash_flow,
        entries_processed: journalEntries.length,
        lines_processed: journalLines.length,
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[calculate-cash-flow] ❌ Error:', error);
    return errorResponse(errorMessage);
  }
});
