import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

interface AutoJournalRequest {
  trigger_event: string;
  reference_id: string;
  reference_type: string;
  amount: number;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { trigger_event, reference_id, reference_type, amount, metadata }: AutoJournalRequest = await req.json();

    // جلب القالب المناسب
    const { data: template, error: templateError } = await supabase
      .from('auto_journal_templates')
      .select('*')
      .eq('trigger_event', trigger_event)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      throw new Error(`لم يتم العثور على قالب للحدث: ${trigger_event}`);
    }

    // جلب السنة المالية النشطة
    const { data: fiscalYear, error: fyError } = await supabase
      .from('fiscal_years')
      .select('id')
      .eq('is_active', true)
      .single();

    if (fyError || !fiscalYear) {
      throw new Error('لم يتم العثور على سنة مالية نشطة');
    }

    // إنشاء رقم القيد
    const { data: lastEntry } = await supabase
      .from('journal_entries')
      .select('entry_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const lastNumber = lastEntry?.entry_number ? parseInt(lastEntry.entry_number.split('-')[1]) : 0;
    const newEntryNumber = `JE-${(lastNumber + 1).toString().padStart(6, '0')}`;

    // إنشاء القيد
    const { data: journalEntry, error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        entry_number: newEntryNumber,
        entry_date: new Date().toISOString().split('T')[0],
        description: `${template.template_name} - ${reference_type} ${reference_id.substring(0, 8)}`,
        status: 'draft',
        fiscal_year_id: fiscalYear.id,
        reference_type: reference_type,
        reference_id: reference_id,
      })
      .select()
      .single();

    if (entryError) throw entryError;

    // إنشاء سطور القيد - المدين
    const debitLines = template.debit_accounts.map((acc: any, idx: number) => {
      const accountAmount = acc.percentage 
        ? (amount * acc.percentage / 100)
        : (acc.fixed_amount || 0);

      return {
        journal_entry_id: journalEntry.id,
        account_id: acc.account_id || null, // يجب تحويل الكود إلى ID
        line_number: idx + 1,
        description: template.description,
        debit_amount: accountAmount,
        credit_amount: 0,
      };
    });

    // إنشاء سطور القيد - الدائن
    const creditLines = template.credit_accounts.map((acc: any, idx: number) => {
      const accountAmount = acc.percentage 
        ? (amount * acc.percentage / 100)
        : (acc.fixed_amount || 0);

      return {
        journal_entry_id: journalEntry.id,
        account_id: acc.account_id || null,
        line_number: debitLines.length + idx + 1,
        description: template.description,
        debit_amount: 0,
        credit_amount: accountAmount,
      };
    });

    // إدراج السطور
    const allLines = [...debitLines, ...creditLines];
    const { error: linesError } = await supabase
      .from('journal_entry_lines')
      .insert(allLines);

    if (linesError) throw linesError;

    // التحقق من التوازن
    const totalDebit = debitLines.reduce((sum: number, line: any) => sum + line.debit_amount, 0);
    const totalCredit = creditLines.reduce((sum: number, line: any) => sum + line.credit_amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`القيد غير متوازن: مدين ${totalDebit} ≠ دائن ${totalCredit}`);
    }

    // تسجيل في log
    await supabase.from('auto_journal_log').insert({
      template_id: template.id,
      journal_entry_id: journalEntry.id,
      trigger_event,
      reference_id,
      reference_type,
      amount,
      success: true,
      metadata,
    });

    // ترحيل القيد تلقائياً
    await supabase
      .from('journal_entries')
      .update({ status: 'posted', posted_at: new Date().toISOString() })
      .eq('id', journalEntry.id);

    return jsonResponse({
      success: true,
      journal_entry_id: journalEntry.id,
      entry_number: newEntryNumber,
    });

  } catch (error: any) {
    console.error('Error creating auto journal:', error);
    return errorResponse(error.message);
  }
});
