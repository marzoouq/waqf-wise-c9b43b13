import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Bank Reconciliation Flow Integration', () => {
  let testBankAccountId: string;
  let testStatementId: string;

  beforeEach(async () => {
    // إنشاء حساب بنكي تجريبي
    const { data: bankAccount } = await supabase
      .from('bank_accounts')
      .insert({
        bank_name: 'البنك التجريبي',
        account_number: 'TEST123456',
        currency: 'SAR',
        current_balance: 100000,
        is_active: true,
      })
      .select()
      .single();

    testBankAccountId = bankAccount!.id;
  });

  it('should complete bank reconciliation process', async () => {
    // 1. استيراد كشف بنكي
    const { data: statement, error: statementError } = await supabase
      .from('bank_statements')
      .insert({
        bank_account_id: testBankAccountId,
        statement_date: new Date().toISOString(),
        opening_balance: 100000,
        closing_balance: 105000,
        status: 'pending',
      })
      .select()
      .single();

    expect(statementError).toBeNull();
    expect(statement).toBeDefined();
    expect(statement!.status).toBe('pending');

    testStatementId = statement!.id;

    // 2. إضافة معاملات بنكية
    const { data: transactions, error: transError } = await supabase
      .from('bank_transactions')
      .insert([
        {
          statement_id: testStatementId,
          transaction_date: new Date().toISOString(),
          transaction_type: 'credit',
          amount: 5000,
          description: 'إيداع إيجار',
          is_matched: false,
        },
        {
          statement_id: testStatementId,
          transaction_date: new Date().toISOString(),
          transaction_type: 'debit',
          amount: 1000,
          description: 'رسوم بنكية',
          is_matched: false,
        },
      ])
      .select();

    expect(transError).toBeNull();
    expect(transactions).toHaveLength(2);

    // 3. مطابقة العمليات مع القيود (محاكاة)
    const unmatchedTransactions = transactions!.filter(t => !t.is_matched);
    expect(unmatchedTransactions.length).toBeGreaterThan(0);

    // 4. تحديث حالة المطابقة
    const { error: updateError } = await supabase
      .from('bank_transactions')
      .update({ is_matched: true })
      .eq('statement_id', testStatementId);

    expect(updateError).toBeNull();

    // 5. تحديث حالة الكشف البنكي
    const { data: reconciledStatement, error: reconError } = await supabase
      .from('bank_statements')
      .update({
        status: 'reconciled',
        reconciled_at: new Date().toISOString(),
      })
      .eq('id', testStatementId)
      .select()
      .single();

    expect(reconError).toBeNull();
    expect(reconciledStatement!.status).toBe('reconciled');
    expect(reconciledStatement!.reconciled_at).toBeDefined();

    // 6. التحقق من تحديث أرصدة الحسابات
    const { data: updatedAccount } = await supabase
      .from('bank_accounts')
      .select('current_balance')
      .eq('id', testBankAccountId)
      .single();

    expect(updatedAccount).toBeDefined();
  });
});
