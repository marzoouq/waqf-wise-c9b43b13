// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PROPERTIES_PAGE_SIZE: 12,
  BENEFICIARIES_PAGE_SIZE: 20,
  PAYMENTS_PAGE_SIZE: 20,
  INVOICES_PAGE_SIZE: 20,
} as const;

// Query Stale Times (in milliseconds)
export const QUERY_STALE_TIME = {
  DEFAULT: 5 * 60 * 1000, // 5 minutes
  BENEFICIARIES: 3 * 60 * 1000, // 3 minutes
  PROPERTIES: 3 * 60 * 1000, // 3 minutes
  PAYMENTS: 3 * 60 * 1000, // 3 minutes
  DASHBOARD: 2 * 60 * 1000, // 2 minutes
  NOTIFICATIONS: 1 * 60 * 1000, // 1 minute
} as const;

// Status Options
export const BENEFICIARY_STATUS = {
  ACTIVE: "نشط",
  INACTIVE: "غير نشط",
  SUSPENDED: "معلق",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "معلق",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
} as const;

export const INVOICE_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  PAID: "paid",
  CANCELLED: "cancelled",
} as const;

export const JOURNAL_ENTRY_STATUS = {
  DRAFT: "draft",
  POSTED: "posted",
  CANCELLED: "cancelled",
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  BANK_TRANSFER: "bank_transfer",
  CHEQUE: "cheque",
  CARD: "card",
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  [PAYMENT_METHODS.CASH]: "نقداً",
  [PAYMENT_METHODS.BANK_TRANSFER]: "تحويل بنكي",
  [PAYMENT_METHODS.CHEQUE]: "شيك",
  [PAYMENT_METHODS.CARD]: "بطاقة",
};

// Payment Types
export const PAYMENT_TYPES = {
  RECEIPT: "receipt",
  PAYMENT: "payment",
} as const;

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  [PAYMENT_TYPES.RECEIPT]: "سند قبض",
  [PAYMENT_TYPES.PAYMENT]: "سند صرف",
};

// Property Types
export const PROPERTY_TYPES = {
  RESIDENTIAL: "سكني",
  COMMERCIAL: "تجاري",
  AGRICULTURAL: "زراعي",
  INDUSTRIAL: "صناعي",
} as const;

// Categories
export const BENEFICIARY_CATEGORIES = {
  FAMILY: "عائلة",
  INDIVIDUAL: "فرد",
  ORGANIZATION: "جهة",
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "dd/MM/yyyy",
  DISPLAY_AR: "dd MMM yyyy",
  INPUT: "yyyy-MM-dd",
  DATETIME: "dd/MM/yyyy HH:mm",
} as const;

// Export Formats
export const EXPORT_FORMATS = {
  PDF: "pdf",
  EXCEL: "excel",
  CSV: "csv",
} as const;

// Query Keys
export const QUERY_KEYS = {
  BENEFICIARIES: "beneficiaries",
  PROPERTIES: "properties",
  PAYMENTS: "payments",
  DISTRIBUTIONS: "distributions",
  INVOICES: "invoices",
  JOURNAL_ENTRIES: "journal_entries",
  ACCOUNTS: "accounts",
  APPROVALS: "approvals",
  DASHBOARD_STATS: "dashboard_stats",
  ACCOUNTING_STATS: "accounting_stats",
  FUNDS: "funds",
  FOLDERS: "folders",
  DOCUMENTS: "documents",
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: "theme",
  SIDEBAR_STATE: "sidebar_state",
  USER_PREFERENCES: "user_preferences",
} as const;

// Validation Rules
export const VALIDATION = {
  PHONE_MIN_LENGTH: 10,
  NATIONAL_ID_LENGTH: 10,
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 999999999,
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,
} as const;

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    ADD: "تمت الإضافة بنجاح",
    UPDATE: "تم التحديث بنجاح",
    DELETE: "تم الحذف بنجاح",
    SAVE: "تم الحفظ بنجاح",
  },
  ERROR: {
    ADD: "خطأ في الإضافة",
    UPDATE: "خطأ في التحديث",
    DELETE: "خطأ في الحذف",
    LOAD: "خطأ في تحميل البيانات",
    GENERIC: "حدث خطأ غير متوقع",
  },
} as const;
