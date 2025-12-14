/**
 * مكونات المستفيد - التصدير المركزي
 * Beneficiary Components - Barrel Export
 * 
 * يمكن الاستيراد من:
 * 1. المجلد الرئيسي: @/components/beneficiary
 * 2. المجلدات الفرعية: @/components/beneficiary/profile
 * 3. الملفات المباشرة: @/components/beneficiary/ProfileHeader
 */

// ==================== Profile Components ====================
export { ProfileHeader } from './ProfileHeader';
export { ProfileStats } from './ProfileStats';
export { ProfileTimeline } from './ProfileTimeline';
export { ProfilePaymentsHistory } from './ProfilePaymentsHistory';
export { ProfileRequestsHistory } from './ProfileRequestsHistory';
export { ProfileFamilyTree } from './ProfileFamilyTree';
export { ProfileDocumentsGallery } from './ProfileDocumentsGallery';
export { BeneficiaryProfileTab } from './BeneficiaryProfileTab';
export { BeneficiaryProfileCard } from './BeneficiaryProfileCard';

// ==================== Tab Components ====================
export { BeneficiaryStatementsTab } from './BeneficiaryStatementsTab';
export { BeneficiaryDistributionsTab } from './BeneficiaryDistributionsTab';
export { BeneficiaryPropertiesTab } from './BeneficiaryPropertiesTab';
export { BeneficiaryDocumentsTab } from './BeneficiaryDocumentsTab';
export { BeneficiaryRequestsTab } from './BeneficiaryRequestsTab';
export { WaqfSummaryTab } from './WaqfSummaryTab';
export { FamilyTreeTab } from './FamilyTreeTab';
export { GovernanceTab } from './GovernanceTab';
export { BankAccountsTab } from './BankAccountsTab';
export { FinancialReportsTab } from './FinancialReportsTab';
export { FinancialTransparencyTab } from './FinancialTransparencyTab';
export { BudgetsTab } from './BudgetsTab';
export { LoansOverviewTab } from './LoansOverviewTab';
export { ApprovalsLogTab } from './ApprovalsLogTab';
export { DisclosuresTab } from './DisclosuresTab';

// ==================== Form Components ====================
export { AddFamilyMemberForm } from './AddFamilyMemberForm';
export { DataUpdateForm } from './DataUpdateForm';
export { EmergencyRequestForm } from './EmergencyRequestForm';
export { LoanRequestForm } from './LoanRequestForm';

// ==================== Dialog Components ====================
export { RequestSubmissionDialog } from './RequestSubmissionDialog';
export { RequestDetailsDialog } from './RequestDetailsDialog';
export { ChangePasswordDialog } from './ChangePasswordDialog';
export { DocumentUploadDialog } from './DocumentUploadDialog';
export { EditEmailDialog } from './EditEmailDialog';
export { EditPhoneDialog } from './EditPhoneDialog';

// ==================== Card Components ====================
export { NotificationsCard } from './NotificationsCard';
export { AnnualDisclosureCard } from './AnnualDisclosureCard';
export { PropertyStatsCards } from './PropertyStatsCards';
export { StatsCard } from './StatsCard';
export { StatsCardSkeleton } from './StatsCardSkeleton';
export { ReportsExplanationCard } from './ReportsExplanationCard';

// ==================== Chart Components ====================
export { DistributionPieChart } from './DistributionPieChart';
export { MonthlyRevenueChart } from './MonthlyRevenueChart';
export { YearlyComparison } from './YearlyComparison';

// ==================== Common Components ====================
export { ActivityTimeline } from './ActivityTimeline';
export { SLAIndicator } from './SLAIndicator';
export { RequestAttachmentsUploader } from './RequestAttachmentsUploader';
export { NotificationPreferences } from './NotificationPreferences';
export { InteractiveCalendar } from './InteractiveCalendar';
export { ContractsTable } from './ContractsTable';
export { BeneficiaryCertificate } from './BeneficiaryCertificate';
export { BeneficiarySettingsDropdown } from './BeneficiarySettingsDropdown';
export { BeneficiarySidebar } from './BeneficiarySidebar';
export { EmptyPaymentsState } from './EmptyPaymentsState';
export { ErrorReportingGuide } from './ErrorReportingGuide';
export { ReportsMenu } from './ReportsMenu';
export { SystemHealthIndicator } from './SystemHealthIndicator';
export { AccountStatementView } from './AccountStatementView';

// ==================== TabContent Wrapper & Error Boundary ====================
export { TabContentWrapper } from './common/TabContentWrapper';
export { TabErrorBoundary } from './common/TabErrorBoundary';
export { TabRenderer } from './TabRenderer';

// ==================== Mobile Card Components ====================
export { 
  MobileCardBase, 
  CardInfoRow, 
  CardInfoGrid, 
  CardInfoItem,
} from './cards/MobileCardBase';

// NOTE: NotificationsBell is now exported from @/components/layout/NotificationsBell
// NotificationsCenter was removed as it was unused

// ==================== Property Components ====================
export { PropertiesListView } from './PropertiesListView';
export { PropertyAccordionView } from './PropertyAccordionView';
export { PropertyUnitsGrid } from './PropertyUnitsGrid';
export { PropertyUnitsDisplay } from './properties/PropertyUnitsDisplay';
export { PreviewModeBanner } from './PreviewModeBanner';

// ==================== Admin Components (للموظفين) ====================
// يمكن الاستيراد من: @/components/beneficiary/admin
export * from './admin';
