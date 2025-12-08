/**
 * Services Layer - الطبقة الخدمية للتطبيق
 * @version 2.8.29
 * تغطية 100% - جميع عمليات Supabase تمر عبر الخدمات
 * 
 * الخدمات: 41 خدمة متكاملة
 * - Core Services: 4
 * - Domain Services: 34
 * - Infrastructure Services: 3
 */

// Core Services (4)
export { NotificationService } from './notification.service';
export { RequestService } from './request.service';
export { VoucherService } from './voucher.service';
export { ReportService } from './report.service';

// Domain Services (34)
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
export { MaintenanceService, type ProviderRating } from './maintenance.service';
export { FundService } from './fund.service';
export { PaymentService, type PaymentFilters } from './payment.service';
export { TribeService } from './tribe.service';
export { UserService, type UserStats } from './user.service';
export { ChatbotService, type ChatMessage, type QuickReply } from './chatbot.service';
export { GovernanceService } from './governance.service';
export { MessageService } from './message.service';
export { AuditService } from './audit.service';
export { POSService, type POSDailyStats, type CashierShift, type POSTransaction, type PendingRental } from './pos.service';
export { BankReconciliationService } from './bank-reconciliation.service';
export { SystemService, type SystemSetting, type SystemHealth, type SecurityAlert, type BackupLog, type BackupSchedule } from './system.service';
export { UIService, type Activity, type Task, type SavedSearch } from './ui.service';
export { SecurityService } from './security.service';
export { SettingsService } from './settings.service';
export { IntegrationService } from './integration.service';
export { MonitoringService, type SystemStats, type SmartAlert, type PerformanceMetric, type SlowQueryLog } from './monitoring.service';
export { KnowledgeService, type KnowledgeArticle, type ProjectPhase } from './knowledge.service';
export { NotificationSettingsService } from './notification-settings.service';
export { DocumentationService, type ProjectPhase as DocProjectPhase, type ChangelogEntry, type AddPhaseInput } from './documentation.service';

// Infrastructure Services (3)
export { StorageService } from './storage.service';
export { EdgeFunctionService } from './edge-function.service';
export { RealtimeService } from './realtime.service';
