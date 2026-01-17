/**
 * قاموس المصطلحات المالية الموحدة
 * يُستخدم كمرجع لجميع المسميات المالية في النظام
 * 
 * @version 1.0.0
 * @description يضمن توحيد المسميات عبر جميع الصفحات واللوحات
 */

/**
 * مصادر البيانات المالية
 */
export const DATA_SOURCES = {
  /** rental_payments (status = مدفوع) + payment_vouchers (type = receipt) */
  COLLECTED_REVENUE: 'rental_payments + payment_vouchers',
  /** contracts.monthly_rent للعقود النشطة */
  EXPECTED_REVENUE: 'contracts.monthly_rent',
  /** accounts (type = revenue).current_balance أو journal_entry_lines */
  ACCOUNTING_REVENUE: 'accounts + journal_entries',
  /** annual_disclosures.total_revenues */
  FISCAL_YEAR_REVENUE: 'annual_disclosures',
} as const;

/**
 * المصطلحات المالية الموحدة
 */
export const FINANCIAL_TERMS = {
  // === التحصيل الفعلي ===
  /** إجمالي المبالغ المحصّلة فعلياً من دفعات الإيجار وسندات القبض */
  TOTAL_COLLECTED: {
    ar: 'إجمالي المحصّل',
    source: DATA_SOURCES.COLLECTED_REVENUE,
    description: 'المبالغ المدفوعة فعلياً من المستأجرين',
    usage: ['لوحات التحكم', 'مؤشرات الأداء'],
  },
  /** المحصّل فعلياً - للبطاقات الصغيرة */
  ACTUALLY_COLLECTED: {
    ar: 'المحصّل فعلياً',
    source: DATA_SOURCES.COLLECTED_REVENUE,
    description: 'التحصيل الفعلي للفترة',
    usage: ['بطاقات التحصيل'],
  },

  // === الإيرادات المتوقعة من العقود ===
  /** الإيراد السنوي المتوقع من العقود النشطة */
  EXPECTED_ANNUAL_REVENUE: {
    ar: 'الإيراد السنوي المتوقع',
    source: DATA_SOURCES.EXPECTED_REVENUE,
    description: 'الإيجار الشهري × 12 للعقود النشطة',
    usage: ['العقود', 'لوحات التحكم'],
  },
  /** الإيراد الشهري من العقود النشطة */
  MONTHLY_REVENUE_FROM_CONTRACTS: {
    ar: 'الإيراد الشهري من العقود',
    source: DATA_SOURCES.EXPECTED_REVENUE,
    description: 'مجموع الإيجارات الشهرية للعقود النشطة',
    usage: ['العقود', 'لوحات التحكم'],
  },

  // === المحاسبة (القوائم المالية) ===
  /** إيرادات الفترة المحاسبية من القيود */
  PERIOD_REVENUE: {
    ar: 'إيرادات الفترة',
    source: DATA_SOURCES.ACCOUNTING_REVENUE,
    description: 'الإيرادات المسجلة في القيود المحاسبية',
    usage: ['قائمة الدخل', 'التقارير المالية'],
  },
  /** مصروفات الفترة المحاسبية */
  PERIOD_EXPENSES: {
    ar: 'مصروفات الفترة',
    source: DATA_SOURCES.ACCOUNTING_REVENUE,
    description: 'المصروفات المسجلة في القيود المحاسبية',
    usage: ['قائمة الدخل', 'التقارير المالية'],
  },
  /** صافي الدخل = إيرادات - مصروفات */
  NET_INCOME: {
    ar: 'صافي الدخل',
    source: 'إيرادات الفترة - مصروفات الفترة',
    description: 'الربح أو الخسارة بعد خصم جميع المصروفات',
    usage: ['قائمة الدخل', 'لوحات التحكم'],
  },

  // === الإفصاحات والسنوات المالية ===
  /** إيرادات السنة المالية للإفصاح */
  FISCAL_YEAR_REVENUE: {
    ar: 'إيرادات السنة المالية',
    source: DATA_SOURCES.FISCAL_YEAR_REVENUE,
    description: 'إجمالي الإيرادات المسجلة للسنة المالية',
    usage: ['الإفصاحات', 'إقفال السنة'],
  },

  // === التوزيعات ===
  /** توزيعات المستفيدين */
  BENEFICIARY_DISTRIBUTIONS: {
    ar: 'توزيعات المستفيدين',
    source: 'heir_distributions + payment_vouchers',
    description: 'المبالغ الموزعة على المستفيدين',
    usage: ['التوزيعات', 'الإفصاحات'],
  },

  // === نسب الأداء ===
  /** نسبة التحصيل */
  COLLECTION_RATE: {
    ar: 'نسبة التحصيل',
    source: 'المحصّل ÷ المستحق',
    description: 'نسبة المبالغ المحصّلة من إجمالي المستحق',
    usage: ['مؤشرات الأداء', 'التقارير'],
  },
} as const;

/** نوع مفاتيح المصطلحات المالية */
export type FinancialTermKey = keyof typeof FINANCIAL_TERMS;

/**
 * دالة للحصول على المسمى العربي للمصطلح
 */
export function getTermLabel(termKey: FinancialTermKey): string {
  return FINANCIAL_TERMS[termKey].ar;
}

/**
 * دالة للحصول على وصف المصطلح
 */
export function getTermDescription(termKey: FinancialTermKey): string {
  return FINANCIAL_TERMS[termKey].description;
}

/**
 * دالة للحصول على مصدر البيانات
 */
export function getTermSource(termKey: FinancialTermKey): string {
  return FINANCIAL_TERMS[termKey].source;
}

/**
 * خريطة التحويل من المسميات القديمة إلى الجديدة
 * تُستخدم للرجوع السريع
 */
export const TERM_MIGRATION_MAP = {
  // المسمى القديم => المسمى الجديد
  'إجمالي الإيرادات': {
    inDashboards: 'إجمالي المحصّل',
    inIncomeStatement: 'إيرادات الفترة',
    inDisclosures: 'إيرادات السنة المالية',
  },
  'الإيراد السنوي': 'الإيراد السنوي المتوقع',
  'الإيراد الشهري': 'الإيراد الشهري من العقود',
  'العائد السنوي المتوقع': 'الإيراد السنوي المتوقع',
  'العائد الشهري': 'الإيراد الشهري من العقود',
  'توزيعات الورثة': 'توزيعات المستفيدين',
  'المحصّل': 'المحصّل فعلياً',
  'المتوقع': 'المستحق للفترة',
} as const;
