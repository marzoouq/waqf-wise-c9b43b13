/**
 * Loans Test Fixtures - بيانات اختبار القروض
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

export const mockLoans: any[] = [];
export const mockLoanInstallments: any[] = [];
export const mockLoanPayments: any[] = [];

export const mockLoanStats = {
  total_loans: 0,
  active_loans: 0,
  paid_loans: 0,
  pending_loans: 0,
  total_principal: 0,
  total_remaining: 0,
  overdue_count: 0,
  overdue_amount: 0,
  this_month_due: 0,
};

export const loanFilters = {
  activeOnly: { status: 'active' },
  paidOnly: { status: 'paid' },
  pendingOnly: { status: 'pending' },
  byBeneficiary: { beneficiaryId: '' },
  overdue: { isOverdue: false },
  byDateRange: { startDate: '', endDate: '' },
};

export const mockLoanPurposes: any[] = [];
