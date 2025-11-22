/**
 * نظام Debug موحد للتطبيق
 * Unified Debug System
 */

const IS_DEV = import.meta.env.DEV;

/**
 * Debug Utility - تسجيل فقط في Development
 */
export const debug = {
  /**
   * تسجيل معلومة عامة
   */
  log: (message: string, data?: unknown) => {
    if (IS_DEV) {
      console.log(message, data);
    }
  },

  /**
   * تسجيل تحذير
   */
  warn: (message: string, data?: unknown) => {
    if (IS_DEV) {
      console.warn(`⚠️ ${message}`, data);
    }
  },

  /**
   * تسجيل معلومة للمطورين فقط
   */
  devtools: (message: string, data?: unknown) => {
    if (IS_DEV) {
      console.log(`🛠️ ${message}`, data);
    }
  },

  /**
   * تسجيل معلومات المصادقة
   */
  auth: (message: string, data?: unknown) => {
    if (IS_DEV) {
      console.log(`🔐 ${message}`, data);
    }
  },

  /**
   * تسجيل معلومات الشبكة
   */
  network: (message: string, data?: unknown) => {
    if (IS_DEV) {
      console.log(`🌐 ${message}`, data);
    }
  },

  /**
   * تسجيل معلومات الأدوار
   */
  roles: (message: string, data?: unknown) => {
    if (IS_DEV) {
      console.log(`👤 ${message}`, data);
    }
  },

  /**
   * تسجيل حالة الاسترجاع
   */
  recovery: (message: string, data?: unknown) => {
    if (IS_DEV) {
      console.log(`🔄 ${message}`, data);
    }
  },

  /**
   * تسجيل معلومات الصحة
   */
  health: (message: string, data?: unknown) => {
    if (IS_DEV) {
      console.log(`❤️ ${message}`, data);
    }
  },
};
