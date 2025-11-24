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

export { DistributionService } from './distribution.service';
export { PaymentService } from './payment.service';

export type { DistributionData, ApprovalData } from './distribution.service';
export type { PaymentData } from './payment.service';
