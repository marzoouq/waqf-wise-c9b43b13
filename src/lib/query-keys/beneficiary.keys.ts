/**
 * Beneficiary Query Keys - مفاتيح استعلامات المستفيدين
 */

export const BENEFICIARY_KEYS = {
  // Core Beneficiaries
  BENEFICIARIES: ['beneficiaries'] as const,
  BENEFICIARY: (id: string) => ['beneficiary', id] as const,
  BENEFICIARY_STATS: ['beneficiary-stats'] as const,
  BENEFICIARY_FAMILIES: ['beneficiary-families'] as const,
  BENEFICIARY_REQUESTS: (id: string) => ['beneficiary-requests', id] as const,
  BENEFICIARY_DISTRIBUTIONS: (id: string) => ['beneficiary-distributions', id] as const,
  BENEFICIARY_STATEMENTS: (id: string) => ['beneficiary-statements', id] as const,
  BENEFICIARY_ATTACHMENTS: (id: string) => ['beneficiary-attachments', id] as const,
  BENEFICIARY_ACTIVITY: ['beneficiary-activity'] as const,
  BENEFICIARY_SESSIONS: ['beneficiary-sessions'] as const,
  MY_BENEFICIARY: (userId?: string) => userId ? ['my-beneficiary', userId] as const : ['my-beneficiary'] as const,
  BENEFICIARY_PAYMENTS: (beneficiaryId: string, ...filters: string[]) => ['beneficiary-payments', beneficiaryId, ...filters] as const,
  BENEFICIARY_ACTIVITY_LOG: (beneficiaryId?: string) => ['beneficiary-activity-log', beneficiaryId] as const,
  BENEFICIARY_CATEGORIES: ['beneficiary-categories'] as const,
  BENEFICIARY_HEIR_DISTRIBUTIONS: (beneficiaryId: string) => ['beneficiary-heir-distributions', beneficiaryId] as const,
  BENEFICIARY_EMERGENCY_AID: (beneficiaryId?: string) => ['beneficiary-emergency-aid', beneficiaryId] as const,
  BENEFICIARY_ID: (userId?: string) => ['beneficiary-id', userId] as const,
  BENEFICIARY_LOANS: (beneficiaryId?: string) => ['beneficiary-loans', beneficiaryId] as const,

  // Beneficiary Timeline & Family
  BENEFICIARY_TIMELINE: (beneficiaryId: string) => ['beneficiary-timeline', beneficiaryId] as const,
  BENEFICIARY_FAMILY: (beneficiaryId: string) => ['beneficiary-family', beneficiaryId] as const,
  
  // Beneficiary Portal & Profile
  CURRENT_BENEFICIARY: (userId?: string) => ['current-beneficiary', userId] as const,
  BENEFICIARY_STATISTICS: (beneficiaryId?: string) => ['beneficiary-statistics', beneficiaryId] as const,
  BENEFICIARY_PROFILE: (userId?: string) => ['beneficiary-profile', userId] as const,
  BENEFICIARY_DOCUMENTS: (beneficiaryId?: string) => ['beneficiary-documents', beneficiaryId] as const,
  BENEFICIARY_PROFILE_PAYMENTS: (beneficiaryId?: string) => ['beneficiary-payments', beneficiaryId] as const,
  // ✅ تم تغيير المفتاح ليكون مختلفاً (كان يتشابه مع BENEFICIARY_REQUESTS)
  BENEFICIARY_PORTAL_REQUESTS: (beneficiaryId?: string) => ['beneficiary-portal-requests', beneficiaryId] as const,
  FAMILY_TREE: (beneficiaryId: string) => ['family-tree', beneficiaryId] as const,
  BENEFICIARY_INTEGRATION_STATS: (beneficiaryId: string) => ['beneficiary-integration-stats', beneficiaryId] as const,
  HEIR_DISTRIBUTIONS_SUMMARY: (beneficiaryId: string) => ['heir-distributions-summary', beneficiaryId] as const,
  
  // Beneficiary Properties
  PROPERTIES_FOR_BENEFICIARY: ['properties-for-beneficiary'] as const,
  CONTRACTS_FOR_BENEFICIARY: (isPublished: boolean) => ['contracts-for-beneficiary', isPublished] as const,
  
  // Beneficiary Tabs Data
  APPROVALS_LOG_BENEFICIARY: ['approvals-log-beneficiary'] as const,
  BANK_ACCOUNTS_BENEFICIARY: ['bank-accounts-beneficiary'] as const,
  ANNUAL_DISCLOSURES_BENEFICIARY: ['annual-disclosures-beneficiary'] as const,
  YEARLY_COMPARISON: (beneficiaryId: string) => ['yearly-comparison', beneficiaryId] as const,
  
  // Yearly Distributions & Requests
  BENEFICIARY_YEARLY_DISTRIBUTIONS: (beneficiaryId?: string, year?: number) => ['beneficiary-yearly-distributions', beneficiaryId, year] as const,
  BENEFICIARY_YEARLY_REQUESTS: (beneficiaryId?: string, year?: number) => ['beneficiary-yearly-requests', beneficiaryId, year] as const,
  
  // Reports
  BENEFICIARIES_REPORT: ['beneficiaries-report'] as const,
  BENEFICIARIES_ACTIVE: ['beneficiaries-active'] as const,
  BENEFICIARY_SESSIONS_LIVE: ['beneficiary-sessions-live'] as const,
  BENEFICIARY_SELECTOR: ['beneficiary-selector'] as const,

  // Staff Requests
  ALL_BENEFICIARY_REQUESTS: ['all-beneficiary-requests'] as const,

  // Eligibility
  ELIGIBILITY_ASSESSMENTS: (beneficiaryId: string) => ['eligibility-assessments', beneficiaryId] as const,

  // Family Members
  FAMILY_MEMBERS: (familyId?: string) => ['family-members', familyId] as const,
  FAMILY_MEMBERS_DIALOG: (familyName: string) => ['family-members-dialog', familyName] as const,
} as const;
