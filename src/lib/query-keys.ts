/**
 * Unified Query Keys - مفاتيح الاستعلامات الموحدة
 * @version 2.8.30
 * 
 * هذا الملف يوفر مفاتيح موحدة لجميع استعلامات React Query
 * لضمان الاتساق وتسهيل إدارة الكاش
 */

export const QUERY_KEYS = {
  // Beneficiaries
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

  // Properties
  PROPERTIES: ['properties'] as const,
  PROPERTY: (id: string) => ['property', id] as const,
  PROPERTY_STATS: ['property-stats'] as const,
  PROPERTY_UNITS: (propertyId: string) => ['property-units', propertyId] as const,

  // Contracts
  CONTRACTS: ['contracts'] as const,
  CONTRACT: (id: string) => ['contract', id] as const,
  
  // Tenants
  TENANTS: ['tenants'] as const,
  TENANT: (id: string) => ['tenant', id] as const,
  TENANT_LEDGER: (tenantId: string) => ['tenant-ledger', tenantId] as const,
  TENANTS_AGING: ['tenants-aging'] as const,

  // Rental Payments
  RENTAL_PAYMENTS: ['rental_payments'] as const,
  RENTAL_PAYMENTS_BY_CONTRACT: (contractId: string) => ['rental_payments', contractId] as const,
  RENTAL_PAYMENTS_COLLECTED: ['rental-payments-collected'] as const,
  RENTAL_PAYMENTS_WITH_FREQUENCY: ['rental-payments-with-frequency'] as const,

  // Payments & Vouchers
  PAYMENTS: ['payments'] as const,
  PAYMENT: (id: string) => ['payment', id] as const,
  PAYMENT_VOUCHERS: ['payment_vouchers'] as const,
  PAYMENT_VOUCHER: (id: string) => ['payment_voucher', id] as const,

  // Accounting
  ACCOUNTS: ['accounts'] as const,
  ACCOUNT: (id: string) => ['account', id] as const,
  ACCOUNTS_FOR_LEDGER: ['accounts_for_ledger'] as const,
  ACCOUNTS_WITH_BALANCES: ['accounts-with-balances'] as const,
  JOURNAL_ENTRIES: ['journal_entries'] as const,
  JOURNAL_ENTRY: (id: string) => ['journal_entry', id] as const,
  JOURNAL_ENTRY_LINES: (entryId: string) => ['journal_entry_lines', entryId] as const,
  JOURNAL_ENTRY_ACCOUNTS: ['journal-entry-accounts'] as const,
  TRIAL_BALANCE: ['trial-balance'] as const,
  TRIAL_BALANCE_BY_YEAR: (fiscalYearId?: string) => ['trial_balance', fiscalYearId] as const,
  BALANCE_SHEET: ['balance-sheet'] as const,
  BALANCE_SHEET_BY_YEAR: (fiscalYearId?: string) => ['balance_sheet', fiscalYearId] as const,
  INCOME_STATEMENT: ['income-statement'] as const,
  INCOME_STATEMENT_BY_YEAR: (fiscalYearId?: string) => ['income_statement', fiscalYearId] as const,
  CASH_FLOW: ['cash-flow'] as const,
  CASH_FLOWS: (fiscalYearId?: string) => ['cash_flows', fiscalYearId] as const,
  BUDGETS: ['budgets'] as const,
  BUDGETS_BY_YEAR: (fiscalYearId?: string) => ['budgets', fiscalYearId] as const,
  BUDGETS_BY_PERIOD: (periodType?: string) => ['budgets', periodType] as const,
  GENERAL_LEDGER: (accountId?: string, dateFrom?: string, dateTo?: string) => ['general_ledger', accountId, dateFrom, dateTo] as const,
  FINANCIAL_DATA: ['financial-data'] as const,
  PENDING_APPROVALS: ['pending_approvals'] as const,
  PENDING_APPROVALS_ALT: ['pending-approvals'] as const,

  // Loans
  LOANS: ['loans'] as const,
  LOAN: (id: string) => ['loan', id] as const,
  LOAN_PAYMENTS: (loanId: string) => ['loan-payments', loanId] as const,
  LOAN_INSTALLMENTS: (loanId: string) => ['loan-installments', loanId] as const,

  // Distributions
  DISTRIBUTIONS: ['distributions'] as const,
  DISTRIBUTION: (id: string) => ['distribution', id] as const,
  DISTRIBUTION_DETAILS: (id: string) => ['distribution-details', id] as const,
  HEIR_DISTRIBUTIONS: ['heir-distributions'] as const,

  // Fiscal Years
  FISCAL_YEARS: ['fiscal_years'] as const,
  FISCAL_YEARS_ALT: ['fiscal-years'] as const,
  FISCAL_YEAR_ACTIVE: ['fiscal-year', 'active'] as const,
  ACTIVE_FISCAL_YEAR: ['active-fiscal-year'] as const,
  ACTIVE_FISCAL_YEARS: ['active-fiscal-years'] as const,
  FISCAL_YEAR: (id: string) => ['fiscal-year', id] as const,
  FISCAL_YEAR_CLOSINGS: ['fiscal-year-closings'] as const,

  // Bank
  BANK_ACCOUNTS: ['bank_accounts'] as const,
  BANK_ACCOUNT: (id: string) => ['bank_account', id] as const,
  BANK_STATEMENTS: ['bank-statements'] as const,
  BANK_TRANSACTIONS: ['bank-transactions'] as const,
  BANK_RECONCILIATION: ['bank-reconciliation'] as const,

  // Invoices
  INVOICES: ['invoices'] as const,
  INVOICE: (id: string) => ['invoice', id] as const,

  // Maintenance
  MAINTENANCE_REQUESTS: ['maintenance-requests'] as const,
  MAINTENANCE_REQUEST: (id: string) => ['maintenance-request', id] as const,
  MAINTENANCE_PROVIDERS: ['maintenance-providers'] as const,
  MAINTENANCE_SCHEDULES: ['maintenance-schedules'] as const,

  // Funds
  FUNDS: ['funds'] as const,
  FUND: (id: string) => ['fund', id] as const,
  FUND_ALLOCATIONS: ['fund-allocations'] as const,

  // Archive
  DOCUMENTS: ['documents'] as const,
  DOCUMENT: (id: string) => ['document', id] as const,
  ARCHIVE_STATS: ['archive-stats'] as const,

  // Users & Auth
  USERS: ['users'] as const,
  USER: (id: string) => ['user', id] as const,
  USER_ROLES: ['user-roles'] as const,
  USER_STATS: ['user-stats'] as const,
  PROFILES: ['profiles'] as const,

  // Notifications
  NOTIFICATIONS: ['notifications'] as const,
  NOTIFICATION_SETTINGS: ['notification-settings'] as const,
  UNREAD_NOTIFICATIONS: ['unread-notifications'] as const,

  // Requests
  REQUESTS: ['requests'] as const,
  REQUEST: (id: string) => ['request', id] as const,
  REQUEST_TYPES: ['request-types'] as const,

  // Reports
  REPORTS: ['reports'] as const,
  REPORT: (id: string) => ['report', id] as const,
  REPORT_TEMPLATES: (reportType?: string) => ['report_templates', reportType] as const,
  ANNUAL_DISCLOSURES: ['annual-disclosures'] as const,

  // Dashboard KPIs
  UNIFIED_KPIS: ['unified-dashboard-kpis'] as const,
  NAZER_KPIS: ['nazer-kpis'] as const,
  ADMIN_KPIS: ['admin-kpis'] as const,
  ACCOUNTANT_KPIS: ['accountant-kpis'] as const,
  CASHIER_KPIS: ['cashier-kpis'] as const,

  // System
  SYSTEM_SETTINGS: ['system-settings'] as const,
  SYSTEM_HEALTH: ['system-health'] as const,
  AUDIT_LOGS: ['audit-logs'] as const,
  ACTIVITIES: ['activities'] as const,
  ERROR_LOGS: ['error-logs'] as const,

  // Organization
  ORGANIZATION_SETTINGS: ['organization-settings'] as const,
  TRIBES: ['tribes'] as const,
  FAMILIES: ['families'] as const,

  // POS
  CASHIER_SHIFTS: ['cashier-shifts'] as const,
  CASHIER_SHIFT_ACTIVE: ['cashier-shift', 'active'] as const,
  POS_TRANSACTIONS: ['pos-transactions'] as const,
  POS_STATS: ['pos-stats'] as const,

  // Approvals
  APPROVALS: ['approvals'] as const,
  APPROVAL_WORKFLOWS: ['approval-workflows'] as const,
  APPROVAL_HISTORY: ['approval-history'] as const,
  DISTRIBUTIONS_WITH_APPROVALS: ['distributions_with_approvals'] as const,
  JOURNAL_APPROVALS: ['journal_approvals'] as const,
  LOANS_WITH_APPROVALS: ['loans_with_approvals'] as const,

  // Chatbot
  USER_ROLES_CHATBOT: (userId?: string) => ['user_roles_chatbot', userId] as const,
  CHATBOT_CONVERSATIONS: (userId?: string) => ['chatbot_conversations', userId] as const,
  CHATBOT_QUICK_REPLIES: ['chatbot_quick_replies'] as const,

  // Messages
  MESSAGES: ['messages'] as const,
  UNREAD_MESSAGES: ['unread-messages'] as const,

  // Support
  SUPPORT_TICKETS: ['support-tickets'] as const,
  SUPPORT_TICKET: (id: string) => ['support-ticket', id] as const,

  // Governance
  GOVERNANCE: ['governance'] as const,
  GOVERNANCE_DOCUMENTS: ['governance-documents'] as const,

  // Knowledge Base
  KNOWLEDGE_ARTICLES: ['knowledge-articles'] as const,
  PROJECT_PHASES: ['project-phases'] as const,

  // Auto Journal
  AUTO_JOURNAL_TEMPLATES: ['auto_journal_templates'] as const,
  AUTO_JOURNAL_LOG: ['auto-journal-log'] as const,

  // AI & Analytics
  AI_INSIGHTS: ['ai-insights'] as const,
  FINANCIAL_KPIS: (fiscalYearId?: string) => ['financial_kpis', fiscalYearId] as const,
  FINANCIAL_FORECASTS: ['financial_forecasts'] as const,

  // Eligibility
  ELIGIBILITY_ASSESSMENTS: (beneficiaryId: string) => ['eligibility-assessments', beneficiaryId] as const,

  // Family Members
  FAMILY_MEMBERS: (familyId?: string) => ['family-members', familyId] as const,

  // Emergency Aid
  EMERGENCY_AID: ['emergency-aid'] as const,
  EMERGENCY_APPROVALS: ['emergency-approvals'] as const,

  // Document Tags & Versions
  DOCUMENT_TAGS: (documentId?: string) => ['document-tags', documentId] as const,
  DOCUMENT_VERSIONS: (documentId: string) => ['document-versions', documentId] as const,

  // Beneficiary Timeline
  BENEFICIARY_TIMELINE: (beneficiaryId: string) => ['beneficiary-timeline', beneficiaryId] as const,
  BENEFICIARY_FAMILY: (beneficiaryId: string) => ['beneficiary-family', beneficiaryId] as const,
} as const;

// Query Config with default settings
export const QUERY_CONFIG = {
  DEFAULT: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },
  REPORTS: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  },
  REALTIME: {
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  },
  STATIC: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  },
} as const;

// Type helpers
export type QueryKeyType = typeof QUERY_KEYS[keyof typeof QUERY_KEYS];
