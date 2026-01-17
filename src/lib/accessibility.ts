/**
 * Accessibility System - نظام الوصولية الشامل
 * WCAG 2.1 AA Compliant
 */

// ==================== ARIA Constants ====================
export const ARIA_LABELS = {
  // Navigation
  navigation: {
    main: 'التنقل الرئيسي',
    breadcrumb: 'مسار التنقل',
    sidebar: 'الشريط الجانبي',
    footer: 'تذييل الصفحة',
    skipToMain: 'تخطي إلى المحتوى الرئيسي',
    skipToNav: 'تخطي إلى التنقل',
  },
  
  // Actions
  actions: {
    close: 'إغلاق',
    open: 'فتح',
    expand: 'توسيع',
    collapse: 'طي',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    refresh: 'تحديث',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    remove: 'إزالة',
    submit: 'إرسال',
    reset: 'إعادة تعيين',
    download: 'تحميل',
    upload: 'رفع',
    print: 'طباعة',
    copy: 'نسخ',
  },
  
  // Status
  status: {
    loading: 'جاري التحميل',
    success: 'تم بنجاح',
    error: 'حدث خطأ',
    warning: 'تحذير',
    info: 'معلومات',
    pending: 'قيد الانتظار',
    completed: 'مكتمل',
  },
  
  // Forms
  forms: {
    required: 'حقل مطلوب',
    optional: 'اختياري',
    invalid: 'قيمة غير صالحة',
    characterCount: (current: number, max: number) => `${current} من ${max} حرف`,
  },
  
  // Tables
  tables: {
    sortAsc: 'مرتب تصاعدياً',
    sortDesc: 'مرتب تنازلياً',
    sortable: 'قابل للترتيب',
    selectRow: 'تحديد الصف',
    selectAll: 'تحديد الكل',
    rowsPerPage: 'صفوف لكل صفحة',
    pageOf: (current: number, total: number) => `صفحة ${current} من ${total}`,
  },
  
  // Dialogs
  dialogs: {
    closeDialog: 'إغلاق النافذة',
    confirmAction: 'تأكيد الإجراء',
    cancelAction: 'إلغاء الإجراء',
  },
} as const;

// ==================== Focus Management ====================

/**
 * عناصر قابلة للتركيز
 */
export const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

/**
 * الحصول على جميع العناصر القابلة للتركيز داخل حاوية
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS))
    .filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
}

/**
 * حصر التركيز داخل حاوية (للـ Modals)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();
  
  return () => container.removeEventListener('keydown', handleKeyDown);
}

/**
 * حفظ واستعادة التركيز
 */
export function createFocusRestore(): { save: () => void; restore: () => void } {
  let savedElement: HTMLElement | null = null;
  
  return {
    save: () => {
      savedElement = document.activeElement as HTMLElement;
    },
    restore: () => {
      savedElement?.focus();
      savedElement = null;
    },
  };
}

// ==================== Keyboard Navigation ====================

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
};

/**
 * التحقق من تطابق الاختصار
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  return (
    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
    !!event.ctrlKey === !!shortcut.ctrl &&
    !!event.altKey === !!shortcut.alt &&
    !!event.shiftKey === !!shortcut.shift &&
    !!event.metaKey === !!shortcut.meta
  );
}

/**
 * اختصارات لوحة المفاتيح الافتراضية
 */
export const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  { key: 'k', ctrl: true, description: 'فتح البحث السريع' },
  { key: '/', description: 'التركيز على البحث' },
  { key: 'Escape', description: 'إغلاق النافذة الحالية' },
  { key: 'n', alt: true, description: 'إنشاء عنصر جديد' },
  { key: 's', ctrl: true, description: 'حفظ' },
  { key: '?', shift: true, description: 'عرض اختصارات لوحة المفاتيح' },
  { key: 'h', alt: true, description: 'الانتقال للصفحة الرئيسية' },
  { key: 'ArrowLeft', alt: true, description: 'العودة للخلف' },
  { key: 'ArrowRight', alt: true, description: 'التقدم للأمام' },
];

// ==================== Live Regions ====================

export type LiveRegionPriority = 'polite' | 'assertive' | 'off';

/**
 * إنشاء منطقة حية للإعلانات
 */
export function createLiveRegion(priority: LiveRegionPriority = 'polite'): {
  announce: (message: string) => void;
  destroy: () => void;
} {
  const region = document.createElement('div');
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', priority);
  region.setAttribute('aria-atomic', 'true');
  region.className = 'sr-only';
  document.body.appendChild(region);
  
  return {
    announce: (message: string) => {
      region.textContent = '';
      // استخدام setTimeout لضمان إعلان التغيير
      setTimeout(() => {
        region.textContent = message;
      }, 100);
    },
    destroy: () => {
      region.remove();
    },
  };
}

// Singleton live region
let globalLiveRegion: ReturnType<typeof createLiveRegion> | null = null;

/**
 * إعلان رسالة لقارئات الشاشة
 */
export function announce(message: string, priority: LiveRegionPriority = 'polite'): void {
  if (!globalLiveRegion) {
    globalLiveRegion = createLiveRegion(priority);
  }
  globalLiveRegion.announce(message);
}

// ==================== Color Contrast ====================

/**
 * حساب نسبة التباين بين لونين
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (rgb: number[]): number => {
    const [r, g, b] = rgb.map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const parseColor = (color: string): number[] => {
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const bigint = parseInt(hex, 16);
      return [
        (bigint >> 16) & 255,
        (bigint >> 8) & 255,
        bigint & 255,
      ];
    }
    // Handle rgb/rgba
    const match = color.match(/\d+/g);
    return match ? match.slice(0, 3).map(Number) : [0, 0, 0];
  };
  
  const l1 = getLuminance(parseColor(color1));
  const l2 = getLuminance(parseColor(color2));
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * التحقق من امتثال WCAG
 */
export function meetsContrastRequirements(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// ==================== Screen Reader Utilities ====================

/**
 * إخفاء عنصر بصرياً مع إبقائه متاحاً لقارئات الشاشة
 */
export const visuallyHiddenStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * CSS class للإخفاء البصري
 */
export const SR_ONLY_CLASS = 'sr-only';

// ==================== Reduced Motion ====================

/**
 * التحقق من تفضيل تقليل الحركة
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * الاستماع لتغييرات تفضيل الحركة
 */
export function onReducedMotionChange(callback: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

// ==================== High Contrast ====================

/**
 * التحقق من وضع التباين العالي
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: more)').matches;
}

// ==================== CSS Classes ====================
export const A11Y_CLASSES = {
  // Screen reader only
  srOnly: 'sr-only',
  notSrOnly: 'not-sr-only',
  
  // Focus styles
  focusVisible: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
  focusWithin: 'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
  
  // Skip links
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:shadow-lg',
  
  // Interactive elements
  interactive: 'cursor-pointer select-none',
  disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
  
  // Touch targets
  touchTarget: 'min-h-[44px] min-w-[44px]',
  
  // High contrast mode
  highContrast: 'forced-colors:outline forced-colors:outline-2',
} as const;

// ==================== Role Descriptions ====================
export const ROLE_DESCRIPTIONS = {
  button: 'زر',
  link: 'رابط',
  checkbox: 'خانة اختيار',
  radio: 'زر اختيار',
  textbox: 'حقل نص',
  listbox: 'قائمة اختيارات',
  menu: 'قائمة',
  menuitem: 'عنصر قائمة',
  tab: 'تبويب',
  tabpanel: 'لوحة تبويب',
  dialog: 'نافذة حوارية',
  alert: 'تنبيه',
  alertdialog: 'نافذة تنبيه',
  progressbar: 'شريط تقدم',
  slider: 'منزلق',
  switch: 'مفتاح تبديل',
  table: 'جدول',
  grid: 'شبكة',
  tree: 'شجرة',
  treegrid: 'شبكة شجرية',
} as const;
