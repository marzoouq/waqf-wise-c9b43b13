/**
 * Services Layer - الطبقة الخدمية للتطبيق
 * @version 2.8.8
 * تغطية 100% - جميع عمليات Supabase تمر عبر الخدمات
 * 
 * الخدمات: 25 خدمة متكاملة
 * - Core Services: 4
 * - Domain Services: 18
 * - Infrastructure Services: 3
 */

// Core Services (4)
export { NotificationService } from './notification.service';
export { RequestService } from './request.service';
export { VoucherService } from './voucher.service';
export { ReportService } from './report.service';

// Domain Services (18)
export { BeneficiaryService, type BeneficiaryFilters, type BeneficiaryStats } from './beneficiary.service';
export { PropertyService, type PropertyStats, type PropertyFilters } from './property.service';
export { DistributionService, type DistributionSummary } from './distribution.service';
export { AccountingService, type FinancialSummary } from './accounting.service';
export { ArchiveService, type ArchiveStats } from './archive.service';
export { LoansService, type LoanStats, type LoanWithInstallments } from './loans.service';
export { AuthService, type UserProfile, type LoginResult } from './auth.service';
export { DashboardService, type SystemOverviewStats, type UnifiedKPIsData } from './dashboard.service';
export { ApprovalService } from './approval.service';
export { FiscalYearService } from './fiscal-year.service';
export { InvoiceService } from './invoice.service';
export { ContractService } from './contract.service';
export { TenantService } from './tenant.service';
export { MaintenanceService } from './maintenance.service';
export { FundService } from './fund.service';
export { PaymentService, type PaymentFilters } from './payment.service';
export { TribeService } from './tribe.service';
export { UserService, type UserStats } from './user.service';
export { ChatbotService, type ChatMessage, type QuickReply } from './chatbot.service';

// Infrastructure Services (3)
export { StorageService } from './storage.service';
export { EdgeFunctionService } from './edge-function.service';
export { RealtimeService } from './realtime.service';
