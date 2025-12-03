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

// Domain Services - خدمات الدومين
export { BeneficiaryService, type BeneficiaryFilters, type BeneficiaryStats } from './beneficiary.service';
export { PropertyService, type PropertyStats, type PropertyFilters } from './property.service';
export { DistributionService, type DistributionSummary } from './distribution.service';
export { AccountingService, type FinancialSummary } from './accounting.service';

// New Services - خدمات جديدة
export { ArchiveService, type ArchiveStats } from './archive.service';
export { LoansService, type LoanStats, type LoanWithInstallments } from './loans.service';
export { AuthService, type UserProfile, type LoginResult } from './auth.service';
