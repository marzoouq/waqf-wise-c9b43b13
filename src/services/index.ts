/**
 * Services Layer - الطبقة الخدمية للتطبيق
 * 
 * تحتوي على جميع منطق الأعمال (Business Logic) المفصول عن واجهة المستخدم
 * 
 * الفوائد:
 * - فصل المنطق عن UI
 * - إعادة استخدام الكود
 * - سهولة الاختبار
 * - صيانة أفضل
 */

// Core Services - الخدمات الأساسية
export { NotificationService } from './notification.service';
export { RequestService } from './request.service';
export { VoucherService } from './voucher.service';
export { ReportService } from './report.service';
