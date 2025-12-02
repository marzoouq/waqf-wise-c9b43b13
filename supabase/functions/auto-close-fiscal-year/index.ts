import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ClosingRequest {
  fiscal_year_id: string;
  preview_only?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { fiscal_year_id, preview_only = false }: ClosingRequest = await req.json();

    console.log('Starting fiscal year closing:', { fiscal_year_id, preview_only });

    // 1. التحقق من السنة المالية
    const { data: fiscalYear, error: fyError } = await supabase
      .from('fiscal_years')
      .select('*')
      .eq('id', fiscal_year_id)
      .single();

    if (fyError || !fiscalYear) {
      throw new Error('السنة المالية غير موجودة');
    }

    if (fiscalYear.is_closed) {
      throw new Error('السنة المالية مغلقة بالفعل');
    }

    // 2. حساب الملخص المالي
    const { data: summary, error: summaryError } = await supabase
      .rpc('calculate_fiscal_year_summary', {
        p_fiscal_year_id: fiscal_year_id
      });

    if (summaryError) {
      console.error('Error calculating summary:', summaryError);
      throw new Error('فشل حساب الملخص المالي');
    }

    console.log('Financial summary:', summary);

    // 3. حساب الإيرادات والمصروفات التفصيلية
    const { data: revenues } = await supabase
      .from('journal_entry_lines')
      .select(`
        account_id,
        credit_amount,
        accounts!inner(name_ar, account_type)
      `)
      .eq('accounts.account_type', 'revenue');

    const { data: expenses } = await supabase
      .from('journal_entry_lines')
      .select(`
        account_id,
        debit_amount,
        accounts!inner(name_ar, account_type)
      `)
      .eq('accounts.account_type', 'expense');

    // 4. حساب توزيعات الورثة
    const { data: heirDistributions } = await supabase
      .from('heir_distributions')
      .select('*')
      .eq('fiscal_year_id', fiscal_year_id);

    // 5. الحصول على إعدادات التوزيع
    const { data: settings } = await supabase
      .from('waqf_distribution_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    const nazerPercentage = settings?.nazer_percentage || 10;
    const waqifPercentage = settings?.waqif_charity_percentage || 5;
    const corpusPercentage = settings?.waqf_corpus_percentage || 0;

    const netIncome = summary.total_revenues - summary.total_expenses;
    const nazerShare = (netIncome * nazerPercentage) / 100;
    const waqifShare = (netIncome * waqifPercentage) / 100;
    const corpusShare = (netIncome * corpusPercentage) / 100;

    // حساب رقبة الوقف (الفائض)
    const waqfCorpus = netIncome - nazerShare - waqifShare - corpusShare - summary.beneficiary_distributions;

    // 6. إنشاء قيد الإقفال المقترح
    const closingEntry = {
      entry_number: `CL-${fiscalYear.year_number}`,
      entry_date: new Date().toISOString().split('T')[0],
      description: `قيد إقفال السنة المالية ${fiscalYear.year_number}`,
      lines: [
        {
          account_code: '4.1.1',
          account_name: 'الإيرادات',
          debit_amount: summary.total_revenues,
          credit_amount: 0,
          description: 'إقفال حساب الإيرادات'
        },
        {
          account_code: '5.1.1',
          account_name: 'المصروفات',
          debit_amount: 0,
          credit_amount: summary.total_expenses,
          description: 'إقفال حساب المصروفات'
        },
        {
          account_code: '3.1.1',
          account_name: 'رقبة الوقف',
          debit_amount: 0,
          credit_amount: waqfCorpus,
          description: 'الفائض المحول لرقبة الوقف'
        }
      ],
      total_debit: summary.total_revenues,
      total_credit: summary.total_expenses + waqfCorpus
    };

    const response = {
      fiscal_year_id,
      fiscal_year_name: fiscalYear.name,
      summary: {
        total_revenues: summary.total_revenues,
        total_expenses: summary.total_expenses,
        vat_collected: summary.vat_collected,
        beneficiary_distributions: summary.beneficiary_distributions,
        net_income: netIncome,
        nazer_percentage: nazerPercentage,
        nazer_share: nazerShare,
        waqif_percentage: waqifPercentage,
        waqif_share: waqifShare,
        corpus_percentage: corpusPercentage,
        corpus_share: corpusShare,
      },
      closing_entry: closingEntry,
      waqf_corpus: waqfCorpus,
      heir_distributions: heirDistributions || [],
      can_close: true,
      warnings: []
    };

    // إذا كان preview_only، نرجع المعاينة فقط
    if (preview_only) {
      console.log('Preview mode - returning preview data');
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 7. تنفيذ الإقفال الفعلي
    console.log('Executing actual closing...');

    // إنشاء قيد الإقفال
    const { data: journalEntry, error: jeError } = await supabase
      .from('journal_entries')
      .insert({
        entry_number: closingEntry.entry_number,
        entry_date: closingEntry.entry_date,
        description: closingEntry.description,
        fiscal_year_id: fiscal_year_id,
        reference_type: 'fiscal_year_closing',
        reference_id: fiscal_year_id,
        status: 'posted'
      })
      .select()
      .single();

    if (jeError) {
      console.error('Error creating journal entry:', jeError);
      throw new Error('فشل إنشاء قيد الإقفال');
    }

    // إضافة بنود القيد
    for (let i = 0; i < closingEntry.lines.length; i++) {
      const line = closingEntry.lines[i];
      const { data: account } = await supabase
        .from('accounts')
        .select('id')
        .eq('code', line.account_code)
        .single();

      if (account) {
        await supabase.from('journal_entry_lines').insert({
          journal_entry_id: journalEntry.id,
          account_id: account.id,
          line_number: i + 1,
          description: line.description,
          debit_amount: line.debit_amount,
          credit_amount: line.credit_amount
        });
      }
    }

    // إنشاء سجل الإقفال
    const { error: closingError } = await supabase
      .from('fiscal_year_closings')
      .insert({
        fiscal_year_id,
        closing_date: new Date().toISOString(),
        closing_type: 'automatic',
        total_revenues: summary.total_revenues,
        total_expenses: summary.total_expenses,
        nazer_percentage: nazerPercentage,
        nazer_share: nazerShare,
        waqif_percentage: waqifPercentage,
        waqif_share: waqifShare,
        total_beneficiary_distributions: summary.beneficiary_distributions,
        total_vat_collected: summary.vat_collected,
        net_income: netIncome,
        waqf_corpus: waqfCorpus,
        closing_journal_entry_id: journalEntry.id,
        heir_distributions: heirDistributions
      });

    if (closingError) {
      console.error('Error creating closing record:', closingError);
      throw new Error('فشل إنشاء سجل الإقفال');
    }

    // إغلاق السنة المالية
    const { error: updateError } = await supabase
      .from('fiscal_years')
      .update({ is_closed: true, status: 'closed' })
      .eq('id', fiscal_year_id);

    if (updateError) {
      console.error('Error closing fiscal year:', updateError);
      throw new Error('فشل إغلاق السنة المالية');
    }

    console.log('Fiscal year closed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إقفال السنة المالية بنجاح',
        data: response 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إقفال السنة المالية';
    console.error('Error in auto-close-fiscal-year:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
