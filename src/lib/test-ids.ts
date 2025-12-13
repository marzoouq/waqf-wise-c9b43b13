/**
 * Test IDs موحدة للاختبارات
 * Unified Test IDs for testing
 * 
 * استخدم هذه الـ IDs في المكونات: data-testid={TEST_IDS.DASHBOARD.NAZER.TITLE}
 * استخدم في الاختبارات: screen.getByTestId(TEST_IDS.DASHBOARD.NAZER.TITLE)
 */

export const TEST_IDS = {
  // ==================== DASHBOARDS ====================
  DASHBOARD: {
    // Nazer Dashboard
    NAZER: {
      CONTAINER: 'nazer-dashboard',
      TITLE: 'nazer-dashboard-title',
      SUBTITLE: 'nazer-dashboard-subtitle',
      TABS: 'nazer-dashboard-tabs',
      TAB_OVERVIEW: 'nazer-tab-overview',
      TAB_BENEFICIARIES: 'nazer-tab-beneficiaries',
      TAB_REPORTS: 'nazer-tab-reports',
      TAB_CONTROL: 'nazer-tab-control',
    },
    // Admin Dashboard
    ADMIN: {
      CONTAINER: 'admin-dashboard',
      TITLE: 'admin-dashboard-title',
      TABS: 'admin-dashboard-tabs',
    },
    // Accountant Dashboard
    ACCOUNTANT: {
      CONTAINER: 'accountant-dashboard',
      TITLE: 'accountant-dashboard-title',
    },
    // Cashier Dashboard
    CASHIER: {
      CONTAINER: 'cashier-dashboard',
      TITLE: 'cashier-dashboard-title',
    },
    // Archivist Dashboard
    ARCHIVIST: {
      CONTAINER: 'archivist-dashboard',
      TITLE: 'archivist-dashboard-title',
    },
    // Beneficiary Portal
    BENEFICIARY: {
      CONTAINER: 'beneficiary-portal',
      TITLE: 'beneficiary-portal-title',
    },
  },

  // ==================== KPI CARDS ====================
  KPI: {
    // Beneficiaries
    BENEFICIARIES_COUNT: 'kpi-beneficiaries-count',
    BENEFICIARIES_CARD: 'kpi-beneficiaries-card',
    ACTIVE_BENEFICIARIES: 'kpi-active-beneficiaries',
    
    // Properties
    PROPERTIES_COUNT: 'kpi-properties-count',
    PROPERTIES_CARD: 'kpi-properties-card',
    ACTIVE_PROPERTIES: 'kpi-active-properties',
    OCCUPIED_PROPERTIES: 'kpi-occupied-properties',
    
    // Financial
    BANK_BALANCE: 'kpi-bank-balance',
    BANK_BALANCE_CARD: 'kpi-bank-balance-card',
    WAQF_CORPUS: 'kpi-waqf-corpus',
    WAQF_CORPUS_CARD: 'kpi-waqf-corpus-card',
    TOTAL_REVENUE: 'kpi-total-revenue',
    TOTAL_EXPENSES: 'kpi-total-expenses',
    NET_INCOME: 'kpi-net-income',
    
    // Contracts
    ACTIVE_CONTRACTS: 'kpi-active-contracts',
    EXPIRING_CONTRACTS: 'kpi-expiring-contracts',
    
    // Loans
    ACTIVE_LOANS: 'kpi-active-loans',
    PENDING_LOANS: 'kpi-pending-loans',
    
    // Distributions
    TOTAL_DISTRIBUTIONS: 'kpi-total-distributions',
    PENDING_DISTRIBUTIONS: 'kpi-pending-distributions',
  },

  // ==================== QUICK ACTIONS ====================
  QUICK_ACTIONS: {
    CONTAINER: 'quick-actions-grid',
    BENEFICIARIES: 'quick-action-beneficiaries',
    PROPERTIES: 'quick-action-properties',
    ACCOUNTING: 'quick-action-accounting',
    REPORTS: 'quick-action-reports',
    SETTINGS: 'quick-action-settings',
    DISTRIBUTIONS: 'quick-action-distributions',
    REQUESTS: 'quick-action-requests',
    ARCHIVE: 'quick-action-archive',
  },

  // ==================== SHARED COMPONENTS ====================
  SHARED: {
    // Header
    DASHBOARD_HEADER: 'dashboard-header',
    HEADER_TITLE: 'header-title',
    HEADER_SUBTITLE: 'header-subtitle',
    REFRESH_BUTTON: 'refresh-button',
    LAST_UPDATE: 'last-update-time',
    
    // Cards
    BANK_BALANCE_CARD: 'bank-balance-card',
    WAQF_CORPUS_CARD: 'waqf-corpus-card',
    
    // Loading
    LOADING_SPINNER: 'loading-spinner',
    SKELETON_LOADER: 'skeleton-loader',
  },

  // ==================== FORMS ====================
  FORM: {
    // Login
    LOGIN_FORM: 'login-form',
    EMAIL_INPUT: 'email-input',
    PASSWORD_INPUT: 'password-input',
    SUBMIT_BUTTON: 'submit-button',
    GOOGLE_LOGIN: 'google-login-button',
    
    // Beneficiary
    BENEFICIARY_FORM: 'beneficiary-form',
    BENEFICIARY_NAME: 'beneficiary-name-input',
    BENEFICIARY_ID: 'beneficiary-id-input',
  },

  // ==================== TABLES ====================
  TABLE: {
    BENEFICIARIES_TABLE: 'beneficiaries-table',
    PROPERTIES_TABLE: 'properties-table',
    CONTRACTS_TABLE: 'contracts-table',
    JOURNAL_ENTRIES_TABLE: 'journal-entries-table',
    DISTRIBUTIONS_TABLE: 'distributions-table',
  },

  // ==================== DIALOGS ====================
  DIALOG: {
    ADD_BENEFICIARY: 'add-beneficiary-dialog',
    EDIT_BENEFICIARY: 'edit-beneficiary-dialog',
    ADD_PROPERTY: 'add-property-dialog',
    ADD_CONTRACT: 'add-contract-dialog',
    DISTRIBUTE_REVENUE: 'distribute-revenue-dialog',
    VIEW_DISCLOSURE: 'view-disclosure-dialog',
  },

  // ==================== NAVIGATION ====================
  NAV: {
    SIDEBAR: 'app-sidebar',
    BOTTOM_NAV: 'bottom-navigation',
    BREADCRUMB: 'breadcrumb',
  },

  // ==================== SECTIONS ====================
  SECTION: {
    CONTROL: 'control-section',
    VISIBILITY_SETTINGS: 'visibility-settings',
    BENEFICIARY_ACTIVITY: 'beneficiary-activity-section',
    REPORTS_SECTION: 'reports-section',
  },
} as const;

// Type helper for extracting test ID values
export type TestIdValue = string;

// Helper function to get all test IDs as flat array (useful for documentation)
export function getAllTestIds(): string[] {
  const ids: string[] = [];
  
  function extractIds(obj: Record<string, unknown>, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        ids.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extractIds(value as Record<string, unknown>, `${prefix}${key}.`);
      }
    }
  }
  
  extractIds(TEST_IDS);
  return ids;
}
