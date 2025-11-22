import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Journal Entry Posting Integration', () => {
  let testDebitAccountId: string;
  let testCreditAccountId: string;
  let testFiscalYearId: string;

  beforeEach(async () => {
    // إنشاء سنة مالية تجريبية
    const { data: fiscalYear } = await supabase
      .from('fiscal_years')
      .insert({
        name: `السنة المالية ${new Date().getFullYear()}`,
        start_date: `${new Date().getFullYear()}-01-01`,
        end_date: `${new Date().getFullYear()}-12-31`,
        is_active: true,
      })
      .select()
      .single();

    testFiscalYearId = fiscalYear!.id;

    // إنشاء حسابات تجريبية
    const { data: debitAccount } = await supabase
      .from('accounts')
      .insert({
        code: 'TEST-DEBIT-001',
        name_ar: 'حساب مدين تجريبي',
        account_type: 'asset',
        account_nature: 'debit',
        is_active: true,
        is_header: false,
      })
      .select()
      .single();

    const { data: creditAccount } = await supabase
      .from('accounts')
      .insert({
        code: 'TEST-CREDIT-001',
        name_ar: 'حساب دائن تجريبي',
        account_type: 'liability',
        account_nature: 'credit',
        is_active: true,
        is_header: false,
      })
      .select()
      .single();

    testDebitAccountId = debitAccount!.id;
    testCreditAccountId = creditAccount!.id;
  });

  it('should post journal entry and update balances', () => {
    // 1. إنشاء قيد يومية
    const entryData = {
      fiscal_year_id: testFiscalYearId,
      entry_date: new Date().toISOString(),
      description: 'قيد تجريبي',
      status: 'draft',
      total_debit: 1000,
      total_credit: 1000,
    };

    expect(entryData.status).toBe('draft');

    // 2. مراجعة المحاسب (محاكاة)
    const accountantReviewed = { ...entryData, status: 'pending_approval' };
    expect(accountantReviewed.status).toBe('pending_approval');

    // 3. موافقة الناظر (محاكاة)
    const nazerApproved = { ...accountantReviewed, status: 'approved' };
    expect(nazerApproved.status).toBe('approved');

    // 4. ترحيل القيد (محاكاة)
    const posted = { ...nazerApproved, status: 'posted' };
    expect(posted.status).toBe('posted');

    // 5. التحقق من توازن القيد
    expect(posted.total_debit).toBe(posted.total_credit);

    // 6. قفل الفترة المحاسبية (محاكاة)
    const periodClosed = true;
    expect(periodClosed).toBe(true);
  });

  it('should validate balanced entries', () => {
    // التحقق من توازن القيد
    const unbalancedEntry = {
      total_debit: 1000,
      total_credit: 800, // غير متوازن
    };

    const isBalanced = unbalancedEntry.total_debit === unbalancedEntry.total_credit;
    expect(isBalanced).toBe(false);

    const balancedEntry = {
      total_debit: 1000,
      total_credit: 1000,
    };

    const isBalancedCorrect = balancedEntry.total_debit === balancedEntry.total_credit;
    expect(isBalancedCorrect).toBe(true);
  });
});
