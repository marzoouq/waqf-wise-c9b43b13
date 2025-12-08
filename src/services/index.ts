/**
 * Services Layer - الطبقة الخدمية للتطبيق
 * @version 2.7.1
 * تغطية 100% - جميع عمليات Supabase تمر عبر الخدمات
 */

// Core Services
export { NotificationService } from './notification.service';
export { RequestService } from './request.service';
export { VoucherService } from './voucher.service';
export { ReportService } from './report.service';

// Domain Services
export { BeneficiaryService, type BeneficiaryFilters, type BeneficiaryStats } from './beneficiary.service';
export { PropertyService, type PropertyStats, type PropertyFilters } from './property.service';
export { DistributionService, type DistributionSummary } from './distribution.service';
export { AccountingService, type FinancialSummary } from './accounting.service';
export { ArchiveService, type ArchiveStats } from './archive.service';
export { LoansService, type LoanStats, type LoanWithInstallments } from './loans.service';
export { AuthService, type UserProfile, type LoginResult } from './auth.service';
export { DashboardService, type SystemOverviewStats, type UnifiedKPIsData } from './dashboard.service';

// NEW Services (Phase 1)
export { ApprovalService } from './approval.service';
export { FiscalYearService } from './fiscal-year.service';
export { InvoiceService } from './invoice.service';
export { ContractService } from './contract.service';
export { TenantService } from './tenant.service';
export { MaintenanceService } from './maintenance.service';
export { FundService } from './fund.service';

// Infrastructure Services
export { StorageService } from './storage.service';
export { EdgeFunctionService } from './edge-function.service';
export { RealtimeService } from './realtime.service';
