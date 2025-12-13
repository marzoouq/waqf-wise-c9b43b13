/**
 * تصدير جميع بيانات الاختبار
 * Export all test fixtures
 */

// المستفيدين
export { 
  realBeneficiaries,
  beneficiaryStats,
  beneficiarySessions,
  getActiveBeneficiaries,
  getBeneficiaryById,
  getBeneficiariesByCategory,
  getOnlineBeneficiaries,
  mockBeneficiaries,
  mockBeneficiarySessions,
} from './beneficiaries.fixtures';

// العقارات والعقود
export {
  realProperties,
  realContracts,
  realTenants,
  propertyStats,
  contractStats,
  getActiveProperties,
  getPropertyById,
  getActiveContracts,
  getContractsByPropertyId,
  getTenantById,
  mockProperties,
  mockContracts,
  mockTenants,
} from './properties.fixtures';

// المالية والمحاسبة
export {
  realAccounts,
  realPayments,
  realJournalEntries,
  realJournalEntryLines,
  realFiscalYears,
  realDistributions,
  realHeirDistributions,
  financialStats,
  getAccountByCode,
  getActivePayments,
  getJournalEntriesByFiscalYear,
  getActiveFiscalYear,
  getDistributionsByFiscalYear,
  mockAccounts,
  mockJournalEntries,
  mockFiscalYears,
  mockPayments,
  mockDistributions,
  mockRentalPayments,
} from './financial.fixtures';

// ==================== KPIs الموحدة ====================
import { beneficiaryStats } from './beneficiaries.fixtures';
import { propertyStats, contractStats } from './properties.fixtures';
import { financialStats, realFiscalYears } from './financial.fixtures';

export const unifiedKPIs = {
  // المستفيدين
  totalBeneficiaries: beneficiaryStats.total,
  activeBeneficiaries: beneficiaryStats.active,
  sonsCount: beneficiaryStats.sons,
  daughtersCount: beneficiaryStats.daughters,
  wivesCount: beneficiaryStats.wives,
  
  // العقارات
  totalProperties: propertyStats.total,
  activeProperties: propertyStats.active,
  vacantProperties: propertyStats.vacant,
  totalUnits: propertyStats.totalUnits,
  
  // العقود
  totalContracts: contractStats.total,
  activeContracts: contractStats.active,
  totalContractAmount: contractStats.totalAmount,
  
  // المالية
  bankBalance: financialStats.bankBalance,
  waqfCorpus: financialStats.waqfCorpus,
  totalCollectedRent: financialStats.totalCollectedRent,
  totalVAT: financialStats.totalVAT,
  totalNetRevenue: financialStats.totalNetRevenue,
  totalDistributed: financialStats.totalDistributed,
  
  // السنة المالية
  currentFiscalYear: realFiscalYears.find(fy => fy.is_active),
  
  // الطلبات
  pendingRequests: 0,
  
  // آخر تحديث
  lastUpdated: new Date().toISOString(),
};

// ==================== Mock Users ====================
export const mockUsers = {
  admin: {
    id: 'user-admin',
    email: 'admin@waqf.sa',
    roles: ['admin'],
  },
  nazer: {
    id: 'user-nazer',
    email: 'nazer@waqf.sa',
    roles: ['nazer'],
  },
  accountant: {
    id: 'user-accountant',
    email: 'accountant@waqf.sa',
    roles: ['accountant'],
  },
  cashier: {
    id: 'user-cashier',
    email: 'cashier@waqf.sa',
    roles: ['cashier'],
  },
  archivist: {
    id: 'user-archivist',
    email: 'archivist@waqf.sa',
    roles: ['archivist'],
  },
  beneficiary: {
    id: 'user-beneficiary',
    email: 'beneficiary@waqf.sa',
    roles: ['beneficiary'],
    beneficiary_id: 'ben-001',
  },
  waqfHeir: {
    id: 'user-heir',
    email: 'heir@waqf.sa',
    roles: ['waqf_heir', 'beneficiary'],
    beneficiary_id: 'ben-001',
  },
};

// ==================== Test Helpers ====================

import { 
  realBeneficiaries, 
  beneficiarySessions 
} from './beneficiaries.fixtures';
import { 
  realProperties, 
  realContracts, 
  realTenants 
} from './properties.fixtures';
import { 
  realAccounts, 
  realPayments, 
  realJournalEntries, 
  realJournalEntryLines,
  realDistributions,
  realHeirDistributions 
} from './financial.fixtures';

/**
 * إعداد جميع البيانات الوهمية للاختبار
 */
export const setupAllMockData = (setMockTableData: <T>(table: string, data: T[]) => void) => {
  setMockTableData('beneficiaries', realBeneficiaries);
  setMockTableData('beneficiary_sessions', beneficiarySessions);
  setMockTableData('properties', realProperties);
  setMockTableData('contracts', realContracts);
  setMockTableData('tenants', realTenants);
  setMockTableData('accounts', realAccounts);
  setMockTableData('payments', realPayments);
  setMockTableData('journal_entries', realJournalEntries);
  setMockTableData('journal_entry_lines', realJournalEntryLines);
  setMockTableData('fiscal_years', realFiscalYears);
  setMockTableData('distributions', realDistributions);
  setMockTableData('heir_distributions', realHeirDistributions);
};

/**
 * إعداد بيانات لوحة تحكم محددة
 */
export const setupDashboardMockData = (
  setMockTableData: <T>(table: string, data: T[]) => void,
  dashboard: 'nazer' | 'admin' | 'beneficiary' | 'accountant' | 'cashier'
) => {
  // البيانات الأساسية لجميع اللوحات
  setMockTableData('beneficiaries', realBeneficiaries);
  setMockTableData('properties', realProperties);
  setMockTableData('contracts', realContracts);
  setMockTableData('fiscal_years', realFiscalYears);
  
  // بيانات إضافية حسب اللوحة
  switch (dashboard) {
    case 'nazer':
      setMockTableData('beneficiary_sessions', beneficiarySessions);
      setMockTableData('distributions', realDistributions);
      setMockTableData('payments', realPayments);
      break;
    case 'admin':
      setMockTableData('accounts', realAccounts);
      break;
    case 'beneficiary':
      setMockTableData('heir_distributions', realHeirDistributions);
      setMockTableData('payments', realPayments);
      break;
    case 'accountant':
      setMockTableData('accounts', realAccounts);
      setMockTableData('journal_entries', realJournalEntries);
      setMockTableData('journal_entry_lines', realJournalEntryLines);
      setMockTableData('payments', realPayments);
      break;
    case 'cashier':
      setMockTableData('payments', realPayments);
      setMockTableData('tenants', realTenants);
      break;
  }
};
