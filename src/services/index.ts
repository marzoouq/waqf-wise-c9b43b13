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

// الخدمات المستخدمة فعلياً
export { NotificationService } from './notification.service';
export { RequestService } from './request.service';

// ملاحظة: تم إزالة الخدمات غير المستخدمة:
// - DistributionService (غير مستخدم)
// - PaymentService (غير مستخدم)
// - ApprovalService (غير مستخدم)
// - BeneficiaryService (غير مستخدم)
