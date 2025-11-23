/**
 * نظام Debug موحد للتطبيق باستخدام Production Logger
 * Unified Debug System using Production Logger
 */

import { productionLogger } from './logger/production-logger';

/**
 * Debug Utility - يستخدم productionLogger للتسجيل الذكي
 * @deprecated استخدم productionLogger مباشرة للميزات الكاملة
 */
export const debug = {
  /**
   * تسجيل معلومة عامة
   */
  log: (message: string, data?: unknown) => {
    productionLogger.debug(message, data);
  },

  /**
   * تسجيل تحذير
   */
  warn: (message: string, data?: unknown) => {
    productionLogger.warn(`⚠️ ${message}`, data);
  },

  /**
   * تسجيل معلومة للمطورين فقط
   */
  devtools: (message: string, data?: unknown) => {
    productionLogger.debug(`🛠️ ${message}`, data);
  },

  /**
   * تسجيل معلومات المصادقة
   */
  auth: (message: string, data?: unknown) => {
    productionLogger.info(`🔐 ${message}`, data);
  },

  /**
   * تسجيل معلومات الشبكة
   */
  network: (message: string, data?: unknown) => {
    productionLogger.debug(`🌐 ${message}`, data);
  },

  /**
   * تسجيل معلومات الأدوار
   */
  roles: (message: string, data?: unknown) => {
    productionLogger.info(`👤 ${message}`, data);
  },

  /**
   * تسجيل حالة الاسترجاع
   */
  recovery: (message: string, data?: unknown) => {
    productionLogger.info(`🔄 ${message}`, data);
  },

  /**
   * تسجيل معلومات الصحة
   */
  health: (message: string, data?: unknown) => {
    productionLogger.info(`❤️ ${message}`, data);
  },
};
