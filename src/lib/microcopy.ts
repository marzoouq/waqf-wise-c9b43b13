/**
 * Microcopy System - نظام نصوص الواجهة الموحد
 * 
 * يوفر نصوصاً موحدة ومتسقة للواجهة عبر التطبيق
 * يدعم التخصيص حسب السياق
 * 
 * @version 1.0.0
 */

// ============================================
// 1. رسائل الأخطاء
// ============================================

export const ERROR_MESSAGES = {
  // أخطاء الشبكة
  network: {
    connection_lost: 'تعذر الاتصال. تحقق من اتصالك بالإنترنت.',
    timeout: 'انتهت مهلة الاتصال. حاول مرة أخرى.',
    server_error: 'حدث خطأ في الخادم. حاول مرة أخرى لاحقاً.',
    rate_limited: 'تم تجاوز الحد المسموح. انتظر قليلاً ثم حاول مرة أخرى.',
    slow_connection: 'اتصالك بطيء. قد يستغرق التحميل وقتاً أطول.',
  },

  // أخطاء المصادقة
  auth: {
    unauthorized: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
    forbidden: 'ليس لديك صلاحية للوصول لهذا المحتوى.',
    invalid_credentials: 'بيانات الدخول غير صحيحة.',
    account_locked: 'تم قفل الحساب. تواصل مع الدعم الفني.',
    password_expired: 'انتهت صلاحية كلمة المرور. يرجى تغييرها.',
  },

  // أخطاء التحقق
  validation: {
    required: 'هذا الحقل مطلوب.',
    invalid_email: 'البريد الإلكتروني غير صالح.',
    invalid_phone: 'رقم الهاتف غير صالح.',
    invalid_id: 'رقم الهوية غير صالح.',
    invalid_iban: 'رقم الآيبان غير صالح.',
    min_length: (min: number) => `يجب أن يكون على الأقل ${min} أحرف.`,
    max_length: (max: number) => `يجب أن لا يتجاوز ${max} حرف.`,
    password_weak: 'كلمة المرور ضعيفة. استخدم أحرف وأرقام ورموز.',
    password_mismatch: 'كلمتا المرور غير متطابقتين.',
  },

  // أخطاء البيانات
  data: {
    not_found: 'لم يتم العثور على البيانات المطلوبة.',
    already_exists: 'البيانات موجودة مسبقاً.',
    cannot_delete: 'لا يمكن حذف هذا العنصر لوجود بيانات مرتبطة.',
    cannot_update: 'لا يمكن تعديل هذا العنصر.',
    invalid_format: 'صيغة البيانات غير صحيحة.',
  },

  // أخطاء عامة
  general: {
    unknown: 'حدث خطأ غير متوقع. حاول مرة أخرى.',
    operation_failed: 'فشلت العملية. حاول مرة أخرى.',
    loading_failed: 'فشل تحميل البيانات.',
    save_failed: 'فشل حفظ البيانات.',
    delete_failed: 'فشل حذف البيانات.',
  },
} as const;

// ============================================
// 2. رسائل النجاح
// ============================================

export const SUCCESS_MESSAGES = {
  // العمليات الأساسية
  crud: {
    created: 'تم الإنشاء بنجاح.',
    updated: 'تم التحديث بنجاح.',
    deleted: 'تم الحذف بنجاح.',
    saved: 'تم الحفظ بنجاح.',
    archived: 'تم الأرشفة بنجاح.',
    restored: 'تم الاستعادة بنجاح.',
  },

  // الإجراءات
  actions: {
    sent: 'تم الإرسال بنجاح.',
    copied: 'تم النسخ إلى الحافظة.',
    downloaded: 'تم التحميل بنجاح.',
    uploaded: 'تم الرفع بنجاح.',
    approved: 'تم الاعتماد بنجاح.',
    rejected: 'تم الرفض.',
    submitted: 'تم الإرسال للمراجعة.',
    confirmed: 'تم التأكيد بنجاح.',
    cancelled: 'تم الإلغاء.',
  },

  // المصادقة
  auth: {
    logged_in: 'تم تسجيل الدخول بنجاح.',
    logged_out: 'تم تسجيل الخروج بنجاح.',
    password_changed: 'تم تغيير كلمة المرور بنجاح.',
    password_reset: 'تم إرسال رابط إعادة تعيين كلمة المرور.',
    email_verified: 'تم التحقق من البريد الإلكتروني.',
  },

  // المالية
  financial: {
    payment_recorded: 'تم تسجيل الدفعة بنجاح.',
    invoice_created: 'تم إنشاء الفاتورة بنجاح.',
    distribution_completed: 'تم التوزيع بنجاح.',
    voucher_created: 'تم إنشاء السند بنجاح.',
  },
} as const;

// ============================================
// 3. رسائل التحميل
// ============================================

export const LOADING_MESSAGES = {
  default: 'جارٍ التحميل...',
  saving: 'جارٍ الحفظ...',
  deleting: 'جارٍ الحذف...',
  uploading: 'جارٍ الرفع...',
  downloading: 'جارٍ التحميل...',
  processing: 'جارٍ المعالجة...',
  sending: 'جارٍ الإرسال...',
  searching: 'جارٍ البحث...',
  refreshing: 'جارٍ التحديث...',
  connecting: 'جارٍ الاتصال...',
  authenticating: 'جارٍ التحقق...',
  calculating: 'جارٍ الحساب...',
  generating: 'جارٍ الإنشاء...',
  syncing: 'جارٍ المزامنة...',
} as const;

// ============================================
// 4. رسائل الحالات الفارغة
// ============================================

export const EMPTY_STATE_MESSAGES = {
  // حالات عامة
  general: {
    no_data: 'لا توجد بيانات للعرض.',
    no_results: 'لا توجد نتائج تطابق البحث.',
    no_items: 'لا توجد عناصر.',
    coming_soon: 'قريباً...',
  },

  // حالات محددة
  specific: {
    no_beneficiaries: 'لا يوجد مستفيدون مسجلون.',
    no_properties: 'لا توجد عقارات مسجلة.',
    no_payments: 'لا توجد مدفوعات.',
    no_invoices: 'لا توجد فواتير.',
    no_distributions: 'لا توجد توزيعات.',
    no_notifications: 'لا توجد إشعارات.',
    no_messages: 'لا توجد رسائل.',
    no_requests: 'لا توجد طلبات.',
    no_attachments: 'لا توجد مرفقات.',
    no_activities: 'لا يوجد نشاط.',
  },

  // إرشادات
  hints: {
    add_first: 'أضف العنصر الأول للبدء.',
    try_different_search: 'جرب كلمات بحث مختلفة.',
    check_filters: 'تحقق من الفلاتر المحددة.',
    refresh_page: 'حاول تحديث الصفحة.',
  },
} as const;

// ============================================
// 5. نصوص الأزرار والإجراءات
// ============================================

export const ACTION_LABELS = {
  // أساسية
  primary: {
    save: 'حفظ',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    create: 'إنشاء',
    close: 'إغلاق',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    finish: 'إنهاء',
    submit: 'إرسال',
    apply: 'تطبيق',
    reset: 'إعادة تعيين',
  },

  // ثانوية
  secondary: {
    retry: 'إعادة المحاولة',
    refresh: 'تحديث',
    reload: 'إعادة تحميل',
    copy: 'نسخ',
    download: 'تحميل',
    upload: 'رفع',
    export: 'تصدير',
    import: 'استيراد',
    print: 'طباعة',
    share: 'مشاركة',
    view: 'عرض',
    details: 'التفاصيل',
    more: 'المزيد',
    less: 'أقل',
    expand: 'توسيع',
    collapse: 'طي',
  },

  // خاصة
  special: {
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    signup: 'إنشاء حساب',
    approve: 'اعتماد',
    reject: 'رفض',
    archive: 'أرشفة',
    restore: 'استعادة',
    search: 'بحث',
    filter: 'فلترة',
    sort: 'ترتيب',
  },
} as const;

// ============================================
// 6. رسائل التأكيد
// ============================================

export const CONFIRMATION_MESSAGES = {
  delete: {
    title: 'تأكيد الحذف',
    message: 'هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.',
    confirm: 'نعم، احذف',
    cancel: 'إلغاء',
  },
  discard: {
    title: 'تجاهل التغييرات',
    message: 'لديك تغييرات غير محفوظة. هل تريد تجاهلها؟',
    confirm: 'نعم، تجاهل',
    cancel: 'الاستمرار في التعديل',
  },
  logout: {
    title: 'تسجيل الخروج',
    message: 'هل أنت متأكد من تسجيل الخروج؟',
    confirm: 'نعم، خروج',
    cancel: 'إلغاء',
  },
  archive: {
    title: 'تأكيد الأرشفة',
    message: 'هل أنت متأكد من أرشفة هذا العنصر؟',
    confirm: 'نعم، أرشف',
    cancel: 'إلغاء',
  },
} as const;

// ============================================
// 7. Helper Functions
// ============================================

/**
 * الحصول على رسالة خطأ بناءً على نوع الخطأ
 */
export function getErrorMessage(type: string, subtype?: string): string {
  const category = ERROR_MESSAGES[type as keyof typeof ERROR_MESSAGES];
  if (!category) return ERROR_MESSAGES.general.unknown;
  
  if (subtype && typeof category === 'object') {
    return (category as Record<string, string>)[subtype] || ERROR_MESSAGES.general.unknown;
  }
  
  return ERROR_MESSAGES.general.unknown;
}

/**
 * الحصول على رسالة نجاح بناءً على نوع العملية
 */
export function getSuccessMessage(type: string, subtype?: string): string {
  const category = SUCCESS_MESSAGES[type as keyof typeof SUCCESS_MESSAGES];
  if (!category) return SUCCESS_MESSAGES.crud.saved;
  
  if (subtype && typeof category === 'object') {
    return (category as Record<string, string>)[subtype] || SUCCESS_MESSAGES.crud.saved;
  }
  
  return SUCCESS_MESSAGES.crud.saved;
}

/**
 * الحصول على رسالة تحميل
 */
export function getLoadingMessage(type?: keyof typeof LOADING_MESSAGES): string {
  return type ? LOADING_MESSAGES[type] : LOADING_MESSAGES.default;
}

/**
 * الحصول على رسالة حالة فارغة
 */
export function getEmptyMessage(type?: string): string {
  if (!type) return EMPTY_STATE_MESSAGES.general.no_data;
  
  const specific = EMPTY_STATE_MESSAGES.specific[type as keyof typeof EMPTY_STATE_MESSAGES.specific];
  return specific || EMPTY_STATE_MESSAGES.general.no_data;
}

/**
 * تخصيص رسالة مع متغيرات
 */
export function interpolateMessage(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(variables[key] ?? `{${key}}`));
}

// ============================================
// 8. Export All
// ============================================

export const MICROCOPY = {
  errors: ERROR_MESSAGES,
  success: SUCCESS_MESSAGES,
  loading: LOADING_MESSAGES,
  empty: EMPTY_STATE_MESSAGES,
  actions: ACTION_LABELS,
  confirmations: CONFIRMATION_MESSAGES,
} as const;

export default MICROCOPY;
