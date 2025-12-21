/**
 * Payments & Distributions Query Keys - مفاتيح استعلامات المدفوعات والتوزيعات
 */

export const PAYMENTS_KEYS = {
  // Payments & Vouchers
  PAYMENTS: ['payments'] as const,
  PAYMENT: (id: string) => ['payment', id] as const,
  PAYMENT_VOUCHERS: ['payment_vouchers'] as const,
  PAYMENT_VOUCHER: (id: string) => ['payment_voucher', id] as const,
  PAYMENT_VOUCHERS_LIST: ['payment-vouchers-list'] as const,
  PAYMENT_VOUCHERS_FILTERED: (searchTerm?: string, status?: string) => ['payment-vouchers', searchTerm, status] as const,
  PAYMENTS_WITH_APPROVALS: ['payments_with_approvals'] as const,
  PAYMENTS_WITH_CONTRACTS: (count: number) => ['payments-with-contracts', count] as const,
  PAYMENT_SCHEDULES: (distributionId?: string) => ['payment-schedules', distributionId] as const,
  PENDING_APPROVALS: ['pending-approvals'] as const,

  // Distributions
  DISTRIBUTIONS: ['distributions'] as const,
  DISTRIBUTION: (id: string) => ['distribution', id] as const,
  DISTRIBUTION_DETAILS: (id: string) => ['distribution-details', id] as const,
  HEIR_DISTRIBUTIONS: ['heir-distributions'] as const,
  DISTRIBUTIONS_WITH_APPROVALS: ['distributions_with_approvals'] as const,
  DISTRIBUTION_VOUCHERS_TAB: (distributionId: string) => ['distribution-vouchers-tab', distributionId] as const,
  DISTRIBUTION_VOUCHERS_STATS_TAB: (distributionId: string) => ['distribution-vouchers-stats-tab', distributionId] as const,
  DISTRIBUTION_ANALYSIS: ['distribution-analysis'] as const,
  DISTRIBUTION_STATUS_STATS: ['distribution-status-stats'] as const,
  DISTRIBUTION_SETTINGS: ['distribution-settings'] as const,
  APPROVED_DISTRIBUTIONS: ['approved-distributions'] as const,
  UNIFIED_TRANSACTIONS: ['unified-transactions'] as const,

  // Bank Transfer
  TRANSFER_STATUS: (fileId: string) => ['transfer-status', fileId] as const,

  // Loans
  LOANS: ['loans'] as const,
  LOAN: (id: string) => ['loan', id] as const,
  LOAN_PAYMENTS: (loanId: string) => ['loan-payments', loanId] as const,
  LOAN_INSTALLMENTS: (loanId?: string) => ['loan-installments', loanId] as const,
  LOAN_SCHEDULES: (loanId: string) => ['loan-schedules', loanId] as const,
  LOANS_WITH_APPROVALS: ['loans_with_approvals'] as const,
  LOANS_AGING: ['loans-aging'] as const,
  LOANS_AGING_CATEGORIES: (data: unknown) => ['loans-aging-categories', data] as const,

  // Approvals
  APPROVALS: ['approvals'] as const,
  APPROVAL_STATUSES: ['approval-statuses'] as const,
  APPROVAL_WORKFLOWS: ['approval-workflows'] as const,
  APPROVAL_HISTORY: ['approval-history'] as const,
  REQUESTS_WITH_APPROVALS: ['requests_with_approvals'] as const,

  // POS
  CASHIER_SHIFTS: ['cashier-shifts'] as const,
  CASHIER_SHIFT_ACTIVE: ['cashier-shift', 'active'] as const,
  CASHIER_SHIFT: ['cashier-shift'] as const,
  POS_TRANSACTIONS: ['pos-transactions'] as const,
  POS_STATS: ['pos-stats'] as const,
  POS_PENDING_RENTALS: ['pos', 'pending-rentals'] as const,
  POS: ['pos'] as const,
  POS_CURRENT_SHIFT: ['pos', 'current-shift'] as const,
  POS_SHIFTS: ['pos', 'shifts'] as const,
  POS_SHIFTS_REPORT: (startDate?: string, endDate?: string) => ['pos-shifts-report', startDate, endDate] as const,
  POS_DAILY_STATS: (date: string) => ['pos-daily-stats', date] as const,
  POS_SHIFT_STATS: (shiftId: string) => ['pos-shift-stats', shiftId] as const,

  // Governance
  GOVERNANCE: ['governance'] as const,
  GOVERNANCE_DOCUMENTS: ['governance-documents'] as const,
  GOVERNANCE_MEETINGS: ['governance-meetings'] as const,
  GOVERNANCE_DECISIONS: ['governance-decisions'] as const,
  GOVERNANCE_DECISION: (id: string) => ['governance-decision', id] as const,
  GOVERNANCE_VOTES: (decisionId: string) => ['governance-votes', decisionId] as const,
  USER_VOTE: (decisionId: string) => ['user-vote', decisionId] as const,
  ELIGIBLE_VOTERS: (decisionId: string) => ['eligible-voters', decisionId] as const,
  RECENT_GOVERNANCE_DECISIONS: ['recent-governance-decisions'] as const,

  // Visibility Settings
  VISIBILITY_SETTINGS: (role: string) => ['visibility-settings', role] as const,
} as const;
