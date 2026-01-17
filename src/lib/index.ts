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

// ==================== Banking & ZATCA ====================
export * from './bankFileGenerators';
export { validateZATCAInvoice } from './validateZATCAInvoice';

// ==================== Cache & Cleanup ====================
export { clearAllCaches, forceRefresh, clearOldCaches, smartCacheClear } from './clearCache';
export { cleanupAlerts, cleanupLocalStorageErrors, runFullCleanup } from './cleanupAlerts';

// ==================== Other Utilities ====================
export { archiveDocument } from './archiveDocument';
export * from './distribution-engine';
// ❌ exportHelpers removed from barrel - import directly to avoid bundling pdf/excel libs
// ❌ excel-helper removed from barrel - import directly when needed
export * from './filters';
// Role labels moved to src/types/roles.ts
export * from './design-tokens';
export * from './version';

// ==================== UX Integration ====================
export * from './ux-integration';
export * from './microcopy';
export { runFullVerification, logVerificationReport, getPhaseSummary, PHASES_SUMMARY, type VerificationReport, type VerificationResult } from './ux-verification';
