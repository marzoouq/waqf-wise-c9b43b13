/**
 * Services Layer - الطبقة الخدمية للتطبيق
 * @version 2.8.86
 * @description تغطية 100% - جميع عمليات Supabase تمر عبر الخدمات
 * 
 * @summary
 * - إجمالي الخدمات: 51+
 * - Core Services: 5 (Notification, Request, Voucher, Report, Dashboard)
 * - Domain Services: 37 (Beneficiary, Property, Accounting, etc.)
 * - Infrastructure Services: 9 (Storage, EdgeFunction, Realtime, etc.)
 * 
 * @architecture
 * - Component → Hook → Service → Supabase
 * - Realtime subscriptions مقبولة في Hooks فقط
 * - جميع الخدمات تستخدم TypeScript strict types
 * 
 * @see docs/ARCHITECTURE_OVERVIEW.md للتوثيق الكامل
 */

// Core Services (5)
export { NotificationService } from './notification.service';
export { RequestService } from './request.service';
export { VoucherService } from './voucher.service';
export { 
  ReportService, 
  CustomReportsService,
  type CashFlowData, 
  type PropertyWithContracts, 
  type OperationRecord,
  type ReportTemplate,
  type CustomReportTemplate,
  type ReportResult,
  type ReportColumn,
} from './report.service';

// Domain Services (37)
export { BeneficiaryService, type BeneficiaryFilters, type BeneficiaryStats } from './beneficiary.service';
export { WaqfService, type WaqfProperty, type UnlinkedProperty } from './waqf.service';
export { DocumentService, type InvoiceData, type InvoiceLine, type ReceiptData, type OrganizationSettings } from './document.service';
export { PropertyService, type PropertyStats, type PropertyFilters } from './property.service';
export { DistributionService, type DistributionSummary } from './distribution.service';
export { AccountingService, type FinancialSummary } from './accounting.service';
export { ArchiveService, type ArchiveStats } from './archive.service';
export { LoansService, type LoanStats, type LoanWithInstallments } from './loans.service';
export { AuthService, PermissionsService, TwoFactorService, type UserProfile, type LoginResult } from './auth.service';
export { PermissionsService as PermissionsSvc, type Permission, type RolePermission } from './permissions.service';
export { TwoFactorService as TwoFactorSvc, type TwoFactorStatus } from './two-factor.service';
export { DashboardService, type SystemOverviewStats, type UnifiedKPIsData, type DashboardKPIs, type BankBalanceData, type FiscalYearCorpus } from './dashboard.service';
export { ApprovalService } from './approval.service';
export { FiscalYearService } from './fiscal-year.service';
export { InvoiceService } from './invoice.service';
export { ContractService } from './contract.service';
export { TenantService } from './tenant.service';
export { MaintenanceService, type ProviderRating } from './maintenance.service';
export { FundService } from './fund.service';
export { PaymentService, type PaymentFilters } from './payment.service';
export { RentalPaymentService, type RentalPayment, type RentalPaymentFilters } from './rental-payment.service';
export { TribeService } from './tribe.service';
export { FamilyService } from './family.service';
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

// Infrastructure Services (5)
export { StorageService } from './storage.service';
export { EdgeFunctionService } from './edge-function.service';
export { RealtimeService } from './realtime.service';
export { DiagnosticsService } from './diagnostics.service';
export { SearchService, type RecentSearch } from './search.service';
export { SupportService, type SupportFilters } from './support.service';
export { ScheduledReportService, type ScheduledReport } from './scheduled-report.service';
export { AIService, type AIInsight } from './ai.service';
export { DisclosureService, type SmartDisclosureDocument } from './disclosure.service';
export { 
  HistoricalRentalService, 
  type HistoricalRentalDetail, 
  type HistoricalRentalMonthlySummary,
  type CreateHistoricalRentalInput 
} from './historical-rental.service';
