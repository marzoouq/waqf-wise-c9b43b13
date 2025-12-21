/**
 * Accounting Query Keys - مفاتيح استعلامات المحاسبة
 */

export const ACCOUNTING_KEYS = {
  // Accounts
  ACCOUNTS: ['accounts'] as const,
  ACCOUNT: (id: string) => ['account', id] as const,
  ACCOUNTS_FOR_LEDGER: ['accounts_for_ledger'] as const,
  ACCOUNTS_WITH_BALANCES: ['accounts-with-balances'] as const,
  REVENUE_ACCOUNTS: ['revenue-accounts'] as const,

  // Journal Entries
  JOURNAL_ENTRIES: ['journal_entries'] as const,
  JOURNAL_ENTRY: (id: string) => ['journal_entry', id] as const,
  JOURNAL_ENTRY_LINES: (entryId: string) => ['journal_entry_lines', entryId] as const,
  JOURNAL_ENTRY_ACCOUNTS: ['journal-entry-accounts'] as const,
  JOURNAL_APPROVALS: ['journal_approvals'] as const,
  RECENT_JOURNAL_ENTRIES: (limit?: number) => ['recent_journal_entries', limit] as const,

  // Reports
  TRIAL_BALANCE: ['trial-balance'] as const,
  TRIAL_BALANCE_BY_YEAR: (fiscalYearId?: string) => ['trial_balance', fiscalYearId] as const,
  BALANCE_SHEET: ['balance-sheet'] as const,
  BALANCE_SHEET_BY_YEAR: (fiscalYearId?: string) => ['balance_sheet', fiscalYearId] as const,
  INCOME_STATEMENT: ['income-statement'] as const,
  INCOME_STATEMENT_BY_YEAR: (fiscalYearId?: string) => ['income_statement', fiscalYearId] as const,
  CASH_FLOW: ['cash-flow'] as const,
  CASH_FLOWS: (fiscalYearId?: string) => ['cash_flows', fiscalYearId] as const,
  CASH_FLOW_REPORT: ['cash-flow-report'] as const,
  GENERAL_LEDGER: (accountId?: string, dateFrom?: string, dateTo?: string) => ['general_ledger', accountId, dateFrom, dateTo] as const,
  FINANCIAL_DATA: ['financial-data'] as const,

  // Budgets
  BUDGETS: ['budgets'] as const,
  BUDGETS_BY_YEAR: (fiscalYearId?: string) => ['budgets', fiscalYearId] as const,
  BUDGETS_BY_PERIOD: (periodType?: string) => ['budgets', periodType] as const,
  BUDGETS_VARIANCE: (fiscalYearId: string) => ['budgets_variance', fiscalYearId] as const,

  // Fiscal Years
  FISCAL_YEARS: ['fiscal-years'] as const,
  FISCAL_YEAR_ACTIVE: ['fiscal-year', 'active'] as const,
  ACTIVE_FISCAL_YEAR: ['active-fiscal-year'] as const,
  ACTIVE_FISCAL_YEARS: ['active-fiscal-years'] as const,
  FISCAL_YEAR: (id: string) => ['fiscal-year', id] as const,
  FISCAL_YEAR_CLOSINGS: ['fiscal-year-closings'] as const,
  FISCAL_YEAR_SUMMARY: (fiscalYearId: string) => ['fiscal-year-summary', fiscalYearId] as const,
  CLOSING_PREVIEW: (fiscalYearId: string) => ['closing-preview', fiscalYearId] as const,

  // Bank
  BANK_ACCOUNTS: ['bank_accounts'] as const,
  BANK_ACCOUNT: (id: string) => ['bank_account', id] as const,
  BANK_STATEMENTS: ['bank-statements'] as const,
  BANK_TRANSACTIONS: ['bank-transactions'] as const,
  BANK_RECONCILIATION: ['bank-reconciliation'] as const,
  BANK_INTEGRATIONS: ['bank-integrations'] as const,
  BANK_STATEMENTS_DATA: ['bank_statements'] as const,
  BANK_TRANSACTIONS_DATA: ['bank_transactions'] as const,
  BANK_BALANCE_REALTIME: ['bank-balance-realtime'] as const,
  WAQF_CORPUS_REALTIME: ['waqf-corpus-realtime'] as const,

  // Invoices
  INVOICES: ['invoices'] as const,
  INVOICE: (id: string) => ['invoice', id] as const,
  INVOICE_LINES: (invoiceId: string) => ['invoice-lines', invoiceId] as const,
  NEXT_INVOICE_NUMBER: ['next-invoice-number'] as const,

  // Auto Journal
  AUTO_JOURNAL_TEMPLATES: ['auto_journal_templates'] as const,
  AUTO_JOURNAL_LOG: ['auto-journal-log'] as const,

  // Financial KPIs
  FINANCIAL_KPIS: (fiscalYearId?: string) => ['financial_kpis', fiscalYearId] as const,
  FINANCIAL_FORECASTS: ['financial_forecasts'] as const,

  // Funds
  FUNDS: ['funds'] as const,
  FUND: (id: string) => ['fund', id] as const,
  FUND_ALLOCATIONS: ['fund-allocations'] as const,
  FUNDS_PERFORMANCE: ['funds-performance'] as const,
  FUNDS_CATEGORY_DISTRIBUTION: (data?: unknown) => ['funds-category-distribution', data] as const,

  // Accounting Link
  ACCOUNTING_LINK_LINKED: ['accounting-link', 'linked'] as const,
  ACCOUNTING_LINK_UNLINKED: ['accounting-link', 'unlinked'] as const,
} as const;
