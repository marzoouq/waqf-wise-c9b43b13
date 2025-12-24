/**
 * Vouchers Test Fixtures - بيانات اختبار سندات الصرف
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

export const mockPaymentVouchers: any[] = [];
export const mockVoucherTypes: any[] = [];

export const mockVoucherStats = {
  total_vouchers: 0,
  pending_count: 0,
  approved_count: 0,
  paid_count: 0,
  rejected_count: 0,
  total_amount: 0,
  pending_amount: 0,
  this_month_count: 0,
  this_month_amount: 0,
};

export const voucherFilters = {
  pendingOnly: { status: 'pending' },
  approvedOnly: { status: 'approved' },
  paidOnly: { status: 'paid' },
  byBeneficiary: { beneficiaryId: '' },
  byType: { paymentType: '' },
  byDateRange: { startDate: '', endDate: '' },
  byDistribution: { distributionId: '' },
};

export const mockVoucherApprovals: any[] = [];
