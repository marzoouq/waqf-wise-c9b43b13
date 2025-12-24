/**
 * بيانات اختبار المالية
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

// تصديرات فارغة
export const realAccounts: any[] = [];
export const realPayments: any[] = [];
export const realJournalEntries: any[] = [];
export const realJournalEntryLines: any[] = [];
export const realFiscalYears: any[] = [];
export const realDistributions: any[] = [];
export const realHeirDistributions: any[] = [];
export const mockAccounts: any[] = [];
export const mockJournalEntries: any[] = [];
export const mockFiscalYears: any[] = [];
export const mockPayments: any[] = [];
export const mockDistributions: any[] = [];
export const mockRentalPayments: any[] = [];

export const financialStats = {
  bankBalance: 0,
  waqfCorpus: 0,
  totalCollectedRent: 0,
  totalVAT: 0,
  totalNetRevenue: 0,
  totalDistributed: 0,
};

// Helper functions
export const getAccountByCode = (code: string) => undefined;
export const getActivePayments = () => [];
export const getJournalEntriesByFiscalYear = (fiscalYearId: string) => [];
export const getActiveFiscalYear = () => undefined;
export const getDistributionsByFiscalYear = (fiscalYearId: string) => [];
