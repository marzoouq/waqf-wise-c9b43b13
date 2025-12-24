/**
 * تصدير جميع بيانات الاختبار
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
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

// المستخدمين والأدوار
export {
  testUsers,
  testUserRoles,
  testProfiles,
  getUserByRole,
  getAllTestUsers,
  getRolesForUser,
  userHasRole,
  getExpectedDashboard,
  loginScenarios,
  permissionScenarios,
  unauthorizedAccessScenarios,
  createAuthContextMock,
  nazerUser,
  adminUser,
  accountantUser,
  cashierUser,
  archivistUser,
  mohamedMarzouq,
} from './users.fixtures';

// الأدوار والصلاحيات
export {
  systemRoles,
  samplePermissions,
  permissionCategories,
  rolePermissionMappings,
  roleAssignmentScenarios,
  getPermissionsForRole,
  roleHasPermission,
  getRolesWithPermission,
  getPermissionsByCategory,
} from './roles.fixtures';

// الدعم الفني
export {
  mockSupportTickets,
  mockTicketComments,
  mockTicketRatings,
  mockSupportStats,
  mockAgentAvailability,
  mockAgentStats,
  mockKnowledgeArticles,
  supportFilters,
} from './support.fixtures';

// الإعدادات
export {
  mockLandingSettings,
  mockZATCASettings,
  mockNotificationSettings,
  mockIntegrations,
  mockBankIntegrations,
  mockTransparencySettings,
  mockSavedFilters,
  mockAdvancedSettings,
  updateSettingInput,
  saveFilterInput,
} from './settings.fixtures';

// الحوكمة
export * from './governance.fixtures';

// الصيانة
export * from './maintenance.fixtures';

// نقطة البيع
export * from './pos.fixtures';

// الأمان
export * from './security.fixtures';

// الأرشيف
export * from './archive.fixtures';

// الرسائل
export * from './messages.fixtures';

// قاعدة المعرفة
export * from './knowledge.fixtures';

// الإفصاحات
export * from './disclosures.fixtures';

// القروض
export * from './loans.fixtures';

// الصناديق
export * from './funds.fixtures';

// سندات الصرف
export * from './vouchers.fixtures';

// الوقف
export * from './waqf.fixtures';

// ==================== KPIs الموحدة ====================
export const unifiedKPIs = {
  totalBeneficiaries: 0,
  activeBeneficiaries: 0,
  sonsCount: 0,
  daughtersCount: 0,
  wivesCount: 0,
  totalProperties: 0,
  activeProperties: 0,
  vacantProperties: 0,
  totalUnits: 0,
  totalContracts: 0,
  activeContracts: 0,
  totalContractAmount: 0,
  bankBalance: 0,
  waqfCorpus: 0,
  totalCollectedRent: 0,
  totalVAT: 0,
  totalNetRevenue: 0,
  totalDistributed: 0,
  currentFiscalYear: undefined,
  pendingRequests: 0,
  lastUpdated: new Date().toISOString(),
};

// ==================== Mock Users ====================
export const mockUsers = {};

// ==================== Test Helpers ====================
export const setupAllMockData = (setMockTableData: <T>(table: string, data: T[]) => void) => {};

export const setupDashboardMockData = (
  setMockTableData: <T>(table: string, data: T[]) => void,
  dashboard: 'nazer' | 'admin' | 'beneficiary' | 'accountant' | 'cashier'
) => {};
