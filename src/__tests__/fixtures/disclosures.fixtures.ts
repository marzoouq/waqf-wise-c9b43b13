/**
 * Disclosures Test Fixtures - بيانات اختبار الإفصاحات
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

export const mockDisclosures: any[] = [];
export const mockDisclosureBeneficiaries: any[] = [];
export const mockRevenueBreakdown: any[] = [];
export const mockExpensesBreakdown: any[] = [];
export const mockMonthlyData: any[] = [];

export const disclosureFilters = {
  byYear: { year: 0 },
  byStatus: { status: '' },
  byFiscalYear: { fiscalYearId: '' },
  draftsOnly: { status: 'draft' },
};

export const mockDisclosureStats = {
  total_disclosures: 0,
  published_count: 0,
  draft_count: 0,
  total_distributed: 0,
  average_beneficiaries: 0,
};
