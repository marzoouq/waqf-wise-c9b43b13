/**
 * Funds Test Fixtures - بيانات اختبار الصناديق
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

export const mockFunds: any[] = [];
export const mockFundTransactions: any[] = [];
export const mockFundAllocations: any[] = [];

export const mockFundStats = {
  total_funds: 0,
  total_balance: 0,
  total_target: 0,
  funds_below_minimum: 0,
  funds_at_target: 0,
  monthly_allocations: 0,
  monthly_withdrawals: 0,
};

export const fundFilters = {
  activeOnly: { isActive: true },
  byType: { fundType: '' },
  belowMinimum: { belowMinimum: false },
  atTarget: { atTarget: false },
};

export const mockFundTypes: any[] = [];
