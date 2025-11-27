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
export { VoucherService } from './voucher.service';
export { ReportService } from './report.service';
export { BankValidationService } from './bank-validation.service';

// ملاحظة: الخدمات التالية متوفرة للاستخدام المستقبلي:
// - DistributionService (متاح في distribution.service.ts)
// - PaymentService (متاح في payment.service.ts)
// - ApprovalService (متاح في approval.service.ts)
// - BeneficiaryService (متاح في beneficiary.service.ts)
// - BudgetService (متاح في budget.service.ts)
