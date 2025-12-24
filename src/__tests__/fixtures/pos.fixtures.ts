/**
 * POS Test Fixtures - بيانات اختبار نقطة البيع
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

// تصديرات فارغة
export const mockCashierShifts: any[] = [];
export const mockCashierShift = {};
export const mockClosedShift = {};
export const mockPOSTransactions: any[] = [];
export const mockDailySettlements: any[] = [];
export const mockPendingRentals: any[] = [];
export const mockShiftReport: any[] = [];

export const mockPOSStats = {
  today: {
    total_transactions: 0,
    total_collected: 0,
    total_disbursed: 0,
    by_payment_method: {},
  },
  this_month: {
    total_transactions: 0,
    total_collected: 0,
    total_disbursed: 0,
  },
};

export const mockDailyStats = {
  total_collections: 0,
  total_payments: 0,
  net_amount: 0,
  transactions_count: 0,
  cash_amount: 0,
  card_amount: 0,
  transfer_amount: 0,
};

export const posTestUsers = {};
export const mockQuickCollectionInput = {};
export const mockQuickPaymentInput = {};
