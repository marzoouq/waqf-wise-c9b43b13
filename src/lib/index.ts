/**
 * Barrel exports for lib utilities
 * المكتبة المركزية للتطبيق
 * 
 * يمكن الاستيراد من:
 * 1. المجلد الرئيسي: @/lib
 * 2. المجلدات الفرعية: @/lib/pdf, @/lib/banking, etc.
 * 3. الملفات المباشرة: @/lib/utils
 */

// ==================== Core Utilities ====================
export { cn, formatCurrency, formatDate, formatNumber } from './utils';
export { logger } from './logger';
export * from './constants';
export * from './errors/types';

// ==================== Performance ====================
export { debounce, throttle, useRenderTracking } from './performance';
export { lazyWithRetry } from './lazyWithRetry';

// ==================== PDF Generators ====================
export { generateDisclosurePDF } from './generateDisclosurePDF';
export { generateInvoicePDF } from './generateInvoicePDF';
export { generateReceiptPDF } from './generateReceiptPDF';
export { generateFiscalYearPDF } from './generateFiscalYearPDF';

// ==================== Banking & ZATCA ====================
export * from './bankFileGenerators';
export { validateZATCAInvoice } from './validateZATCAInvoice';

// ==================== Cache & Cleanup ====================
export { clearAllCaches, forceRefresh, clearOldCaches, smartCacheClear } from './clearCache';
export { cleanupAlerts, cleanupLocalStorageErrors, runFullCleanup } from './cleanupAlerts';

// ==================== Other Utilities ====================
export { archiveDocument } from './archiveDocument';
export * from './distribution-engine';
export * from './exportHelpers';
export * from './filters';
export * from './role-labels';
export * from './design-tokens';
export * from './version';
export * from './mutationHelpers';
