/**
 * Unified Query Keys - مفاتيح الاستعلامات الموحدة
 * @version 2.8.86
 * @module lib/query-keys
 * 
 * @description
 * هذا الملف يوفر مفاتيح موحدة لجميع استعلامات React Query
 * لضمان الاتساق وتسهيل إدارة الكاش
 * 
 * @example
 * ```typescript
 * import { QUERY_KEYS, QUERY_CONFIG } from '@/lib/query-keys';
 * 
 * // استخدام مفتاح بسيط
 * useQuery({ queryKey: QUERY_KEYS.BENEFICIARIES });
 * 
 * // استخدام مفتاح مع معاملات
 * useQuery({ queryKey: QUERY_KEYS.BENEFICIARY(id) });
 * ```
 * 
 * @see docs/ARCHITECTURE_OVERVIEW.md للتوثيق الكامل
 */

export const QUERY_KEYS = {
  // Users & Roles (top level - with params)
  USER_ROLES: (userId: string) => ['user-roles', userId] as const,
  TRANSFER_STATUS: (fileId: string) => ['transfer-status', fileId] as const,
  
  // Standalone Keys
  CUSTOM_REPORTS: ['custom-reports'] as const,
  APPROVAL_STATUSES: ['approval-statuses'] as const,
  BENEFICIARY_SELECTOR: ['beneficiary-selector'] as const,

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
  MY_BENEFICIARY: (userId?: string) => userId ? ['my-beneficiary', userId] as const : ['my-beneficiary'] as const,
  BENEFICIARY_PAYMENTS: (beneficiaryId: string, ...filters: string[]) => ['beneficiary-payments', beneficiaryId, ...filters] as const,
  BENEFICIARY_ACTIVITY_LOG: (beneficiaryId?: string) => ['beneficiary-activity-log', beneficiaryId] as const,
  BENEFICIARY_CATEGORIES: ['beneficiary-categories'] as const,
  BENEFICIARY_HEIR_DISTRIBUTIONS: (beneficiaryId: string) => ['beneficiary-heir-distributions', beneficiaryId] as const,
  BENEFICIARY_EMERGENCY_AID: (beneficiaryId?: string) => ['beneficiary-emergency-aid', beneficiaryId] as const,
  BENEFICIARY_ID: (userId?: string) => ['beneficiary-id', userId] as const,
  BENEFICIARY_LOANS: (beneficiaryId?: string) => ['beneficiary-loans', beneficiaryId] as const,

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
  PENDING_APPROVALS: ['pending-approvals'] as const,

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
  FISCAL_YEARS: ['fiscal-years'] as const,
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
  ARCHIVIST_STATS: ['archivist-stats'] as const,
  RECENT_DOCUMENTS: (category: string, searchTerm: string) => ['recent-documents', category, searchTerm] as const,
  FOLDERS: ['folders'] as const,

  // Users & Auth
  USERS: ['users'] as const,
  USER: (id: string) => ['user', id] as const,
  USER_STATS: ['user-stats'] as const,
  PROFILES: ['profiles'] as const,
  PROFILE: (userId?: string) => userId ? ['profile', userId] : ['profile'] as const,
  ACTIVE_SESSIONS: (userId?: string) => userId ? ['active-sessions', userId] : ['active-sessions'] as const,
  USER_PERMISSIONS: (userId?: string) => userId ? ['user-permissions', userId] : ['user-permissions'] as const,

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
  NAZER_SYSTEM_OVERVIEW: ['nazer-system-overview'] as const,
  NAZER_BENEFICIARIES_QUICK: ['nazer-beneficiaries-quick'] as const,
  ADMIN_KPIS: ['admin-kpis'] as const,
  ACCOUNTANT_KPIS: ['accountant-kpis'] as const,
  CASHIER_KPIS: ['cashier-kpis'] as const,

  // System
  SYSTEM_SETTINGS: ['system-settings'] as const,
  SYSTEM_HEALTH: ['system-health'] as const,
  AUDIT_LOGS: ['audit-logs'] as const,
  ACTIVITIES: ['activities'] as const,
  ERROR_LOGS: ['error-logs'] as const,
  
  // System Monitoring & Performance (Phase 1 - Admin Dashboard)
  SECURITY_ALERTS: ['security-alerts'] as const,
  SYSTEM_PERFORMANCE_METRICS: ['system-performance-metrics'] as const,
  USERS_ACTIVITY_METRICS: ['users-activity-metrics'] as const,
  SYSTEM_ERROR_LOGS: ['system-error-logs'] as const,
  SYSTEM_ALERTS: ['system-alerts'] as const,
  SYSTEM_STATS: ['system-stats'] as const,
  RECENT_ERRORS: ['recent-errors'] as const,
  ACTIVE_ALERTS: ['active-alerts'] as const,
  FIX_ATTEMPTS: ['fix-attempts'] as const,
  
  // Integrations
  BANK_INTEGRATIONS: ['bank-integrations'] as const,
  PAYMENT_GATEWAYS: ['payment-gateways'] as const,
  GOVERNMENT_INTEGRATIONS: ['government-integrations'] as const,
  
  // Backup
  BACKUP_LOGS: ['backup-logs'] as const,
  BACKUP_SCHEDULES: ['backup-schedules'] as const,

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
  PAYMENTS_WITH_APPROVALS: ['payments_with_approvals'] as const,
  REQUESTS_WITH_APPROVALS: ['requests_with_approvals'] as const,

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
  TICKET_COMMENTS: (ticketId: string) => ['ticket-comments', ticketId] as const,
  AGENT_AVAILABILITY: (userId: string) => ['agent-availability', userId] as const,
  AGENT_STATS: (userId: string, dateRange?: { from: string; to: string }) => ['agent-stats', userId, dateRange] as const,
  SUPPORT_ESCALATIONS: ['support-escalations'] as const,
  ASSIGNMENT_SETTINGS: ['assignment-settings'] as const,
  KB_ARTICLES: ['kb-articles'] as const,
  KB_FAQS: ['kb-faqs'] as const,
  TRANSLATIONS: ['translations'] as const,
  BIOMETRIC_CREDENTIALS: ['biometric-credentials'] as const,

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
  
  // Beneficiary Portal & Profile
  CURRENT_BENEFICIARY: (userId?: string) => ['current-beneficiary', userId] as const,
  BENEFICIARY_STATISTICS: (beneficiaryId?: string) => ['beneficiary-statistics', beneficiaryId] as const,
  BENEFICIARY_PROFILE: (userId?: string) => ['beneficiary-profile', userId] as const,
  BENEFICIARY_DOCUMENTS: (beneficiaryId?: string) => ['beneficiary-documents', beneficiaryId] as const,
  BENEFICIARY_PROFILE_PAYMENTS: (beneficiaryId?: string) => ['beneficiary-payments', beneficiaryId] as const,
  BENEFICIARY_PROFILE_REQUESTS: (beneficiaryId?: string) => ['beneficiary-requests', beneficiaryId] as const,
  FAMILY_TREE: (beneficiaryId: string) => ['family-tree', beneficiaryId] as const,
  REQUEST_DETAILS: (requestId: string) => ['request-details', requestId] as const,
  REQUEST_MESSAGES: (requestId: string) => ['request-messages', requestId] as const,
  BENEFICIARY_INTEGRATION_STATS: (beneficiaryId: string) => ['beneficiary-integration-stats', beneficiaryId] as const,
  HEIR_DISTRIBUTIONS_SUMMARY: (beneficiaryId: string) => ['heir-distributions-summary', beneficiaryId] as const,
  
  // Beneficiary Properties
  PROPERTIES_FOR_BENEFICIARY: ['properties-for-beneficiary'] as const,
  CONTRACTS_FOR_BENEFICIARY: (isPublished: boolean) => ['contracts-for-beneficiary', isPublished] as const,
  
  // Beneficiary Tabs Data
  APPROVALS_LOG_BENEFICIARY: ['approvals-log-beneficiary'] as const,
  BANK_ACCOUNTS_BENEFICIARY: ['bank-accounts-beneficiary'] as const,
  ANNUAL_DISCLOSURES_BENEFICIARY: ['annual-disclosures-beneficiary'] as const,
  DISTRIBUTION_PIE_CHART: ['distribution-pie-chart'] as const,
  YEARLY_COMPARISON: (beneficiaryId: string) => ['yearly-comparison', beneficiaryId] as const,
  MONTHLY_REVENUE_CHART: ['monthly-revenue-chart'] as const,
  PROPERTY_STATS_COMBINED: ['property-stats-combined'] as const,
  
  // Yearly Distributions & Requests
  BENEFICIARY_YEARLY_DISTRIBUTIONS: (beneficiaryId?: string, year?: number) => ['beneficiary-yearly-distributions', beneficiaryId, year] as const,
  BENEFICIARY_YEARLY_REQUESTS: (beneficiaryId?: string, year?: number) => ['beneficiary-yearly-requests', beneficiaryId, year] as const,
  
  // Waqf Summary
  WAQF_SUMMARY: ['waqf-summary'] as const,
  WAQF_UNITS: ['waqf-units'] as const,
  
  // Cashier Stats
  CASHIER_STATS: ['cashier-stats'] as const,
  
  // Dashboard Charts
  BUDGET_COMPARISON_CHART: ['budget-comparison-chart'] as const,
  REVENUE_EXPENSE_CHART: ['revenue-expense-chart'] as const,
  DASHBOARD_KPIS: ['dashboard-kpis'] as const,
  DASHBOARD_BENEFICIARIES: (timeRange?: string) => ['dashboard-beneficiaries', timeRange] as const,
  DASHBOARD_PAYMENTS: (timeRange?: string) => ['dashboard-payments', timeRange] as const,
  DASHBOARD_PROPERTIES: ['dashboard-properties'] as const,
  BANK_BALANCE_REALTIME: ['bank-balance-realtime'] as const,
  WAQF_CORPUS_REALTIME: ['waqf-corpus-realtime'] as const,
  REVENUE_DISTRIBUTION: ['revenue-distribution'] as const,
  REVENUE_PROGRESS: (fiscalYearId?: string) => ['revenue-progress', fiscalYearId] as const,
  VOUCHERS_STATS: ['vouchers-stats'] as const,
  RECENT_JOURNAL_ENTRIES: (limit?: number) => ['recent_journal_entries', limit] as const,
  KPIS: (category?: string) => ['kpis', category] as const,
  
  // Search History
  SEARCH_HISTORY: (searchType?: string) => ['search-history', searchType] as const,
  
  // Global Search
  GLOBAL_SEARCH_BENEFICIARIES: (query: string) => ['global-search-beneficiaries', query] as const,
  GLOBAL_SEARCH_PROPERTIES: (query: string) => ['global-search-properties', query] as const,
  GLOBAL_SEARCH_LOANS: (query: string) => ['global-search-loans', query] as const,
  GLOBAL_SEARCH_DOCUMENTS: (query: string) => ['global-search-documents', query] as const,
  
  // Scheduled Reports
  SCHEDULED_REPORTS: ['scheduled-reports'] as const,
  
  // Ticket Ratings
  TICKET_RATING: (ticketId: string) => ['ticket-rating', ticketId] as const,
  TICKET_RATINGS: ['ticket-ratings'] as const,
  
  // Support Stats
  SUPPORT_STATS: ['support-stats'] as const,
  
  // Recent Searches
  RECENT_SEARCHES: (searchType: string) => ['recent-searches', searchType] as const,
  
  // Loans Aging Report
  LOANS_AGING: ['loans-aging'] as const,
  LOANS_AGING_CATEGORIES: (data: unknown) => ['loans-aging-categories', data] as const,
  
  // Budget Variance
  BUDGETS_VARIANCE: (fiscalYearId: string) => ['budgets_variance', fiscalYearId] as const,
  
  // AI Insights
  SMART_ALERTS: ['smart-alerts'] as const,
  
  // Admin Alerts
  ADMIN_ALERTS: ['admin-alerts'] as const,
  
  // Dashboard Config
  DASHBOARD_CONFIGS: ['dashboard-configs'] as const,
  
  // KB Articles Extended
  KB_ARTICLES_FEATURED: ['kb-articles', 'featured'] as const,
  KB_ARTICLE: (id: string) => ['kb-article', id] as const,
  
  // Maintenance Cost
  MAINTENANCE_COST_ANALYSIS: ['maintenance-cost-analysis'] as const,
  MAINTENANCE_TYPE_ANALYSIS: ['maintenance-type-analysis'] as const,
  
  // Additional Report Keys (Phase 3 Unification)
  BENEFICIARIES_REPORT: ['beneficiaries-report'] as const,
  BENEFICIARIES_ACTIVE: ['beneficiaries-active'] as const,
  BENEFICIARY_SESSIONS_LIVE: ['beneficiary-sessions-live'] as const,
  PROPERTIES_REPORT: ['properties-report'] as const,
  PROPERTIES_STATS_ALT: ['properties-stats'] as const,
  PROPERTIES_PERFORMANCE: ['properties-performance'] as const,
  FISCAL_YEAR_SUMMARY: (fiscalYearId: string) => ['fiscal-year-summary', fiscalYearId] as const,
  
  // Project Documentation (Phase 3 Unification)
  PROJECT_DOCUMENTATION: (category?: string) => ['project-documentation', category] as const,
  PHASE_CHANGELOG: (phaseId: string) => ['phase-changelog', phaseId] as const,
  
  // Disclosure
  ANNUAL_DISCLOSURE_CURRENT: ['annual-disclosure-current'] as const,
  DISCLOSURE_BENEFICIARIES: (disclosureId?: string) => ['disclosure-beneficiaries', disclosureId] as const,
  DISCLOSURE_DOCUMENTS: (disclosureId?: string) => ['disclosure-documents', disclosureId] as const,
  
  // Payment Schedules
  PAYMENT_SCHEDULES: (distributionId?: string) => ['payment-schedules', distributionId] as const,
  
  // Staff Requests
  ALL_BENEFICIARY_REQUESTS: ['all-beneficiary-requests'] as const,
  
  // Property Units Data
  PROPERTY_UNITS_DATA: (propertyId: string) => ['property-units-data', propertyId] as const,
  
  // Distribution Tabs
  DISTRIBUTION_VOUCHERS_TAB: (distributionId: string) => ['distribution-vouchers-tab', distributionId] as const,
  DISTRIBUTION_VOUCHERS_STATS_TAB: (distributionId: string) => ['distribution-vouchers-stats-tab', distributionId] as const,
  PAYMENT_VOUCHERS_LIST: ['payment-vouchers-list'] as const,
  FAMILY_MEMBERS_DIALOG: (familyName: string) => ['family-members-dialog', familyName] as const,
  
  // Role Permissions
  ROLE_PERMISSIONS: (role?: string) => ['role-permissions', role] as const,
  
  // Saved Searches
  SAVED_SEARCHES: ['saved-searches'] as const,
  
  // Bank Data
  BANK_STATEMENTS_DATA: ['bank_statements'] as const,
  BANK_TRANSACTIONS_DATA: ['bank_transactions'] as const,
  
  // Available Users
  AVAILABLE_USERS: ['available-users'] as const,
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
