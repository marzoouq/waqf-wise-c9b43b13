/**
 * 🔒 PROTECTED FILE
 * Central constants for status matching across the system.
 * Any change may break multiple services and UI components.
 * 
 * See: docs/TRUTH_MAP.md
 * Requires: Full regression testing after any modification
 */

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PROPERTIES_PAGE_SIZE: 12,
  BENEFICIARIES_PAGE_SIZE: 20,
  FAMILIES_PAGE_SIZE: 20,
  REQUESTS_PAGE_SIZE: 20,
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

export const PROPERTY_STATUS = {
  ACTIVE: "نشط",
  INACTIVE: "غير نشط",
  VACANT: "شاغر",
  RENTED: "مؤجر",
  PARTIAL: "جزئي",
  MAINTENANCE: "صيانة",
} as const;

export const CONTRACT_STATUS = {
  ACTIVE: "نشط",
  DRAFT: "مسودة",
  PENDING: "معلق",
  EXPIRED: "منتهي",
  CANCELLED: "ملغي",
} as const;

export const LOAN_STATUS = {
  ACTIVE: "نشط",
  PAID: "مسدد",
  DEFAULTED: "متعثر",
} as const;

// Tenant Status - مع دعم ثنائي اللغة
export const TENANT_STATUS = {
  ACTIVE: "نشط",
  ACTIVE_EN: "active",
  INACTIVE: "غير نشط",
  INACTIVE_EN: "inactive",
  SUSPENDED: "معلق",
  SUSPENDED_EN: "suspended",
} as const;

// قائمة الحالات النشطة للمستأجرين (للفلاتر)
export const TENANT_ACTIVE_STATUSES = ["نشط", "active"] as const;

// Family Status
export const FAMILY_STATUS = {
  ACTIVE: "نشط",
  INACTIVE: "غير نشط",
} as const;

export const REQUEST_STATUS = {
  PENDING: "معلق",
  APPROVED: "موافق عليه",
  REJECTED: "مرفوض",
  IN_PROGRESS: "قيد المعالجة",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "معلق",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
  PAID: "مدفوع",
  OVERDUE: "متأخر",
  PARTIAL: "مدفوع جزئياً",
  UNDER_COLLECTION: "تحت التحصيل",
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

// Company Information (for Invoices and Legal Documents)
export const COMPANY_INFO = {
  NAME_AR: "منصة الوقف",
  NAME_EN: "Waqf Platform",
  DESCRIPTION_AR: "نظام إدارة الوقف الإلكتروني",
  DESCRIPTION_EN: "Electronic Waqf Management System",
  TAX_NUMBER: "300000000000003",
  COMMERCIAL_REGISTRATION: "1010000000",
  ADDRESS_AR: "الرياض - المملكة العربية السعودية",
  ADDRESS_EN: "Riyadh - Kingdom of Saudi Arabia",
  PHONE: "+966 11 123 4567",
  EMAIL: "info@waqfplatform.sa",
  WEBSITE: "www.waqfplatform.sa",
  COPYRIGHT_AR: "© 2025 منصة الوقف - جميع الحقوق محفوظة",
  COPYRIGHT_EN: "© 2025 Waqf Platform - All Rights Reserved",
} as const;

// Distribution Settings
export const DISTRIBUTION_CONFIG = {
  NAZER_SHARE_PERCENTAGE: 10,
  WAQIF_SHARE_PERCENTAGE: 5,
  HEIR_MALE_RATIO: 2,
  HEIR_FEMALE_RATIO: 1,
  WIVES_SHARE_RATIO: 0.125, // 1/8
} as const;

// Maintenance Status
export const MAINTENANCE_STATUS = {
  NEW: "جديد",
  PENDING: "معلق",
  IN_REVIEW: "قيد المراجعة",
  IN_PROGRESS: "قيد التنفيذ",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
} as const;

// Maintenance Open Statuses - الحالات المفتوحة للصيانة (مصدر حقيقة موحد)
export const MAINTENANCE_OPEN_STATUSES = [
  "جديد", "معلق", "قيد المراجعة", "قيد التنفيذ"
] as const;

// Maintenance Closed Statuses - الحالات المغلقة للصيانة
export const MAINTENANCE_CLOSED_STATUSES = [
  "مكتمل", "ملغي"
] as const;

// Collection Source - مصدر التحصيل الرسمي
export const COLLECTION_SOURCE = {
  TABLE: 'payment_vouchers',
  TYPE: 'receipt',
  STATUS: 'paid'
} as const;

// Unit Status
export const UNIT_STATUS = {
  AVAILABLE: "متاح",
  OCCUPIED: "مشغول",
  MAINTENANCE: "صيانة",
  UNAVAILABLE: "غير متاح",
} as const;

// Alert Severity
export const ALERT_SEVERITY = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

// Approval Status
export const APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

// Voucher Status - حالات السندات المالية
export const VOUCHER_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PAID: "paid",
  CANCELLED: "cancelled",
  CONFIRMED: "confirmed",
} as const;

// Voucher Status Labels
export const VOUCHER_STATUS_LABELS: Record<string, string> = {
  "draft": "مسودة",
  "pending": "معلق",
  "paid": "مدفوع",
  "cancelled": "ملغي",
  "confirmed": "مؤكد",
};

// Approval Workflow Status - حالات سير عمل الموافقات
export const APPROVAL_WORKFLOW_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
  ESCALATED: "escalated",
} as const;

// Approval Workflow Status Labels
export const APPROVAL_WORKFLOW_STATUS_LABELS: Record<string, string> = {
  "pending": "في الانتظار",
  "in_progress": "قيد المعالجة",
  "approved": "معتمد",
  "rejected": "مرفوض",
  "completed": "مكتمل",
  "escalated": "مصعّد",
};

// Fiscal Year Status
export const FISCAL_YEAR_STATUS = {
  ACTIVE: "نشط",
  CLOSED: "مغلق",
  PENDING_CLOSURE: "قيد الإغلاق",
} as const;

// API Rate Limits
export const API_RATE_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 60,
  BATCH_SIZE: 100,
} as const;

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: ["pdf", "png", "jpg", "jpeg", "doc", "docx", "xls", "xlsx"],
} as const;

// Dashboard Metrics Constants
export const DASHBOARD_METRICS = {
  ACTIVITY_DAYS: 7,
  PERFORMANCE_HOURS_INTERVAL: 4,
  PERFORMANCE_LOOKBACK_DAYS: 1,
  MAX_ALERTS_DISPLAY: 10,
  MAX_RECENT_ENTRIES: 5,
  REFRESH_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
} as const;

// Chart Display Constants  
export const CHART_CONSTANTS = {
  DEFAULT_HEIGHT: 300,
  MOBILE_HEIGHT: 200,
  ANIMATION_DURATION: 300,
  LEGEND_POSITION: "bottom",
} as const;

// === Unit Type Labels (ترجمة نوع الوحدة) ===
export const UNIT_TYPE_LABELS: Record<string, string> = {
  "apartment": "شقة",
  "villa": "فيلا",
  "shop": "محل تجاري",
  "office": "مكتب",
  "warehouse": "مستودع",
  "other": "أخرى",
  "شقة": "شقة",
  "فيلا": "فيلا",
  "محل تجاري": "محل تجاري",
  "محل": "محل تجاري",
  "مكتب": "مكتب",
  "مستودع": "مستودع",
  "أخرى": "أخرى",
};

// === Unit Status Labels (ترجمة حالة الوحدة) ===
export const UNIT_STATUS_LABELS: Record<string, string> = {
  "available": "متاح",
  "occupied": "مشغول",
  "maintenance": "صيانة",
  "unavailable": "غير متاح",
  "متاح": "متاح",
  "مشغول": "مشغول",
  "صيانة": "صيانة",
  "غير متاح": "غير متاح",
};

// === Payment Status Labels (ترجمة حالة الدفع) ===
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  "completed": "مكتمل",
  "pending": "معلق",
  "cancelled": "ملغي",
  "paid": "مدفوع",
  "overdue": "متأخر",
  "partial": "مدفوع جزئياً",
  "under_collection": "تحت التحصيل",
  "مكتمل": "مكتمل",
  "معلق": "معلق",
  "ملغي": "ملغي",
  "مدفوع": "مدفوع",
  "متأخر": "متأخر",
  "مدفوع جزئياً": "مدفوع جزئياً",
  "تحت التحصيل": "تحت التحصيل",
};

// === Account Type Labels (ترجمة نوع الحساب) ===
export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  "asset": "أصول",
  "liability": "التزامات",
  "equity": "حقوق ملكية",
  "revenue": "إيرادات",
  "expense": "مصروفات",
  "أصول": "أصول",
  "التزامات": "التزامات",
  "حقوق ملكية": "حقوق ملكية",
  "إيرادات": "إيرادات",
  "مصروفات": "مصروفات",
};

// === Journal Entry Type Labels (ترجمة نوع القيد) ===
export const JOURNAL_ENTRY_TYPE_LABELS: Record<string, string> = {
  "manual": "يدوي",
  "auto": "تلقائي",
  "يدوي": "يدوي",
  "تلقائي": "تلقائي",
};

// === Invoice Status Labels (ترجمة حالة الفاتورة) ===
export const INVOICE_STATUS_LABELS: Record<string, string> = {
  "draft": "مسودة",
  "sent": "مُرسل",
  "paid": "مدفوع",
  "cancelled": "ملغي",
};

// === Journal Entry Status Labels (ترجمة حالة القيد) ===
export const JOURNAL_ENTRY_STATUS_LABELS: Record<string, string> = {
  "draft": "مسودة",
  "posted": "مُرحّل",
  "cancelled": "ملغي",
};

// === Approval Status Labels (ترجمة حالة الاعتماد) ===
export const APPROVAL_STATUS_LABELS: Record<string, string> = {
  "pending": "معلق",
  "approved": "معتمد",
  "rejected": "مرفوض",
};

// === Helper Functions (دوال الترجمة المساعدة) ===
export function getUnitTypeLabel(type: string | null | undefined): string {
  if (!type) return "غير محدد";
  return UNIT_TYPE_LABELS[type.toLowerCase()] || UNIT_TYPE_LABELS[type] || type;
}

export function getUnitStatusLabel(status: string | null | undefined): string {
  if (!status) return "غير محدد";
  return UNIT_STATUS_LABELS[status.toLowerCase()] || UNIT_STATUS_LABELS[status] || status;
}

export function getPaymentStatusLabel(status: string | null | undefined): string {
  if (!status) return "غير محدد";
  return PAYMENT_STATUS_LABELS[status.toLowerCase()] || PAYMENT_STATUS_LABELS[status] || status;
}

export function getAccountTypeLabel(type: string | null | undefined): string {
  if (!type) return "غير محدد";
  return ACCOUNT_TYPE_LABELS[type.toLowerCase()] || ACCOUNT_TYPE_LABELS[type] || type;
}

export function getJournalEntryTypeLabel(type: string | null | undefined): string {
  if (!type) return "غير محدد";
  return JOURNAL_ENTRY_TYPE_LABELS[type.toLowerCase()] || JOURNAL_ENTRY_TYPE_LABELS[type] || type;
}

export function getInvoiceStatusLabel(status: string | null | undefined): string {
  if (!status) return "غير محدد";
  return INVOICE_STATUS_LABELS[status.toLowerCase()] || INVOICE_STATUS_LABELS[status] || status;
}

export function getJournalEntryStatusLabel(status: string | null | undefined): string {
  if (!status) return "غير محدد";
  return JOURNAL_ENTRY_STATUS_LABELS[status.toLowerCase()] || JOURNAL_ENTRY_STATUS_LABELS[status] || status;
}

export function getApprovalStatusLabel(status: string | null | undefined): string {
  if (!status) return "غير محدد";
  return APPROVAL_STATUS_LABELS[status.toLowerCase()] || APPROVAL_STATUS_LABELS[status] || status;
}

export function getVoucherStatusLabel(status: string | null | undefined): string {
  if (!status) return "غير محدد";
  return VOUCHER_STATUS_LABELS[status.toLowerCase()] || VOUCHER_STATUS_LABELS[status] || status;
}

export function getApprovalWorkflowStatusLabel(status: string | null | undefined): string {
  if (!status) return "غير محدد";
  return APPROVAL_WORKFLOW_STATUS_LABELS[status.toLowerCase()] || APPROVAL_WORKFLOW_STATUS_LABELS[status] || status;
}

// Occupancy Status - حالة الإشغال
export const OCCUPANCY_STATUS = {
  VACANT: "شاغر",
  OCCUPIED: "مشغول",
  MAINTENANCE: "صيانة",
} as const;

// Ticket Status - حالات التذاكر
export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

// Transfer Status - حالات التحويلات
export const TRANSFER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

// Distribution Status - حالات التوزيعات
export const DISTRIBUTION_STATUS = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  DISTRIBUTED: "distributed",
  CANCELLED: "cancelled",
} as const;

// Disclosure Status - حالات الإفصاحات
export const DISCLOSURE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

// ZATCA Check Status - حالات فحص ZATCA
export const ZATCA_CHECK_STATUS = {
  PASS: "pass",
  WARNING: "warning",
  FAIL: "fail",
} as const;

// === Status Matching Mappings ===
const STATUS_MAPPINGS: Record<string, string[]> = {
  'active': ['نشط', 'active'],
  // Occupancy
  'vacant': ['شاغر', 'vacant', 'available'],
  'شاغر': ['شاغر', 'vacant', 'available'],
  'occupied': ['مشغول', 'occupied'],
  'مشغول': ['مشغول', 'occupied'],
  'نشط': ['نشط', 'active'],
  'inactive': ['غير نشط', 'inactive'],
  'غير نشط': ['غير نشط', 'inactive'],
  'suspended': ['معلق', 'suspended'],
  'pending': ['معلق', 'pending', 'قيد المراجعة'],
  'معلق': ['معلق', 'pending', 'قيد المراجعة', 'suspended'],
  'completed': ['مكتمل', 'completed', 'paid', 'مدفوع'],
  'مكتمل': ['مكتمل', 'completed', 'paid', 'مدفوع'],
  'paid': ['مدفوع', 'paid', 'مكتمل', 'completed'],
  'مدفوع': ['مدفوع', 'paid', 'مكتمل', 'completed'],
  'draft': ['مسودة', 'draft'],
  'مسودة': ['مسودة', 'draft'],
  'cancelled': ['ملغي', 'cancelled'],
  'ملغي': ['ملغي', 'cancelled'],
  'approved': ['موافق عليه', 'approved', 'معتمد', 'موافق'],
  'موافق عليه': ['موافق عليه', 'approved', 'معتمد', 'موافق'],
  'موافق': ['موافق', 'approved', 'معتمد', 'موافق عليه'],
  'new': ['جديد', 'new'],
  'جديد': ['جديد', 'new'],
  // System statuses
  'healthy': ['سليم', 'healthy'],
  'سليم': ['سليم', 'healthy'],
  'acknowledged': ['تم الإقرار', 'acknowledged'],
  'تم الإقرار': ['تم الإقرار', 'acknowledged'],
  'stopped': ['متوقف', 'stopped'],
  'متوقف': ['متوقف', 'stopped'],
  'standby': ['استعداد', 'standby'],
  'استعداد': ['استعداد', 'standby'],
  'resolved': ['محلول', 'resolved'],
  'محلول': ['محلول', 'resolved'],
  // Governance decision statuses
  'voting': ['قيد التصويت', 'voting'],
  'قيد التصويت': ['قيد التصويت', 'voting'],
  'executing': ['قيد التنفيذ', 'executing'],
  'قيد التنفيذ': ['قيد التنفيذ', 'executing'],
  'executed': ['منفذ', 'executed'],
  'منفذ': ['منفذ', 'executed'],
  'rejected': ['مرفوض', 'rejected'],
  'مرفوض': ['مرفوض', 'rejected'],
  'معتمد': ['معتمد', 'approved', 'موافق عليه', 'موافق'],
  // Disclosure statuses
  'published': ['منشور', 'published'],
  'منشور': ['منشور', 'published'],
  // Emergency aid statuses
  'disbursed': ['صُرف', 'disbursed', 'مصروف'],
  'صُرف': ['صُرف', 'disbursed', 'مصروف'],
  // Posted statuses
  'posted': ['مرحّل', 'posted', 'مُرحّل'],
  'مرحّل': ['مرحّل', 'posted', 'مُرحّل'],
};

/**
 * دالة للمقارنة الآمنة بين القيم العربية والإنجليزية
 * Helper function for safe comparison between Arabic and English status values
 */
export function matchesStatus(
  value: string | null | undefined,
  ...expectedStatuses: string[]
): boolean {
  if (!value) return false;
  const normalizedValue = value.toLowerCase();
  
  return expectedStatuses.some(expected => {
    const mappings = STATUS_MAPPINGS[expected.toLowerCase()] || [expected];
    return mappings.some(m => normalizedValue === m.toLowerCase());
  });
}
