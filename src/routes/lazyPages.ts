/**
 * تحميل كسول للصفحات مع آلية إعادة المحاولة
 * Lazy loading for pages with retry mechanism
 */

import { lazyWithRetry } from "@/lib/lazyWithRetry";

// ==================== الصفحات العامة ====================
export const LandingPage = lazyWithRetry(() => import("@/pages/LandingPage"));
export const Login = lazyWithRetry(() => import("@/pages/Login"));
export const Signup = lazyWithRetry(() => import("@/pages/Signup"));
export const Install = lazyWithRetry(() => import("@/pages/Install"));
export const Unauthorized = lazyWithRetry(() => import("@/pages/Unauthorized"));
export const NotFound = lazyWithRetry(() => import("@/pages/NotFound"));

// صفحات قانونية ومعلوماتية
export const PrivacyPolicy = lazyWithRetry(() => import("@/pages/PrivacyPolicy"));
export const TermsOfUse = lazyWithRetry(() => import("@/pages/TermsOfUse"));
export const SecurityPolicyPage = lazyWithRetry(() => import("@/pages/SecurityPolicy"));
export const FAQ = lazyWithRetry(() => import("@/pages/FAQ"));
export const Contact = lazyWithRetry(() => import("@/pages/Contact"));

// ==================== لوحات التحكم ====================
export const Dashboard = lazyWithRetry(() => import("@/pages/Dashboard"));
export const NazerDashboard = lazyWithRetry(() => import("@/pages/NazerDashboard"));
export const AccountantDashboard = lazyWithRetry(() => import("@/pages/AccountantDashboard"));
export const CashierDashboard = lazyWithRetry(() => import("@/pages/CashierDashboard"));
export const ArchivistDashboard = lazyWithRetry(() => import("@/pages/ArchivistDashboard"));
export const AdminDashboard = lazyWithRetry(() => import("@/pages/AdminDashboard"));

// ==================== صفحات المستفيدين ====================
export const Beneficiaries = lazyWithRetry(() => import("@/pages/Beneficiaries"));
export const BeneficiaryProfile = lazyWithRetry(() => import("@/pages/BeneficiaryProfile"));
export const BeneficiarySupport = lazyWithRetry(() => import("@/pages/BeneficiarySupport"));
export const BeneficiaryRequests = lazyWithRetry(() => import("@/pages/BeneficiaryRequests"));
export const BeneficiaryAccountStatement = lazyWithRetry(() => import("@/pages/BeneficiaryAccountStatement"));
export const BeneficiaryReports = lazyWithRetry(() => import("@/pages/BeneficiaryReports"));
export const BeneficiaryPortal = lazyWithRetry(() => import("@/pages/BeneficiaryPortal"));

// ==================== إدارة العائلات ====================
export const Families = lazyWithRetry(() => import("@/pages/Families"));
export const FamilyDetails = lazyWithRetry(() => import("@/pages/FamilyDetails"));

// ==================== العقارات والأصول ====================
export const Properties = lazyWithRetry(() => import("@/pages/Properties"));
export const Tenants = lazyWithRetry(() => import("@/pages/Tenants"));
export const TenantDetails = lazyWithRetry(() => import("@/pages/TenantDetails"));
export const TenantsAgingReportPage = lazyWithRetry(() => import("@/pages/TenantsAgingReportPage"));
export const Funds = lazyWithRetry(() => import("@/pages/Funds"));
export const WaqfUnits = lazyWithRetry(() => import("@/pages/WaqfUnits"));

// ==================== المحاسبة والمالية ====================
export const Accounting = lazyWithRetry(() => import("@/pages/Accounting"));
export const FiscalYearsManagement = lazyWithRetry(() => import("@/pages/FiscalYearsManagement"));
export const Budgets = lazyWithRetry(() => import("@/pages/Budgets"));
export const Invoices = lazyWithRetry(() => import("@/pages/Invoices"));
export const Payments = lazyWithRetry(() => import("@/pages/Payments"));
export const PaymentVouchers = lazyWithRetry(() => import("@/pages/PaymentVouchers"));
export const Loans = lazyWithRetry(() => import("@/pages/Loans"));
export const BankTransfers = lazyWithRetry(() => import("@/pages/BankTransfers"));
export const AllTransactions = lazyWithRetry(() => import("@/pages/AllTransactions"));
export const Approvals = lazyWithRetry(() => import("@/pages/Approvals"));

// ==================== الأرشيف والتقارير ====================
export const Archive = lazyWithRetry(() => import("@/pages/Archive"));
export const Reports = lazyWithRetry(() => import("@/pages/Reports"));
export const CustomReportsPage = lazyWithRetry(() => import("@/pages/CustomReports"));

// ==================== الطلبات والدعم ====================
export const Requests = lazyWithRetry(() => import("@/pages/Requests"));
export const StaffRequestsManagement = lazyWithRetry(() => import("@/pages/StaffRequestsManagement"));
export const EmergencyAidManagement = lazyWithRetry(() => import("@/pages/EmergencyAidManagement"));
export const Support = lazyWithRetry(() => import("@/pages/Support"));
export const SupportManagement = lazyWithRetry(() => import("@/pages/SupportManagement"));
export const KnowledgeBase = lazyWithRetry(() => import("@/pages/KnowledgeBase"));
export const Messages = lazyWithRetry(() => import("@/pages/Messages"));

// ==================== الحوكمة ====================
export const GovernanceDecisions = lazyWithRetry(() => import("@/pages/GovernanceDecisions"));
export const DecisionDetails = lazyWithRetry(() => import("@/pages/DecisionDetails"));
export const WaqfGovernanceGuide = lazyWithRetry(() => import("@/pages/WaqfGovernanceGuide"));

// ==================== الإعدادات ====================
export const Settings = lazyWithRetry(() => import("@/pages/Settings"));
export const BeneficiarySettings = lazyWithRetry(() => import("@/pages/BeneficiarySettings"));
export const TransparencySettings = lazyWithRetry(() => import("@/pages/TransparencySettings"));
export const LandingPageSettings = lazyWithRetry(() => import("@/pages/LandingPageSettings"));
export const NotificationSettingsPage = lazyWithRetry(() => import("@/pages/NotificationSettings"));
export const AdvancedSettings = lazyWithRetry(() => import("@/pages/AdvancedSettings"));

// ==================== الإشعارات ====================
export const Notifications = lazyWithRetry(() => import("@/pages/Notifications"));

// ==================== المستخدمين والأدوار ====================
export const Users = lazyWithRetry(() => import("@/pages/Users"));
export const RolesManagement = lazyWithRetry(() => import("@/pages/RolesManagement"));
export const PermissionsManagement = lazyWithRetry(() => import("@/pages/PermissionsManagement"));
export const AuditLogs = lazyWithRetry(() => import("@/pages/AuditLogs"));

// ==================== النظام والمراقبة ====================
export const SystemMonitoring = lazyWithRetry(() => import("@/pages/SystemMonitoring"));
export const SystemErrorLogs = lazyWithRetry(() => import("@/pages/SystemErrorLogs"));
export const SystemMaintenance = lazyWithRetry(() => import("@/pages/SystemMaintenance"));
export const SystemTesting = lazyWithRetry(() => import("@/pages/SystemTesting"));
export const SecurityDashboard = lazyWithRetry(() => import("@/pages/SecurityDashboard"));
export const PerformanceDashboard = lazyWithRetry(() => import("@/pages/PerformanceDashboard"));
export const IntegrationsManagement = lazyWithRetry(() => import("@/pages/IntegrationsManagement"));

// ==================== أدوات المطور ====================
export const DeveloperGuide = lazyWithRetry(() => import("@/pages/DeveloperGuide"));
export const DeveloperTools = lazyWithRetry(() => import("@/pages/DeveloperTools"));
export const ProjectDocumentation = lazyWithRetry(() => import("@/pages/ProjectDocumentation"));

// ==================== الذكاء الاصطناعي ====================
export const AIInsights = lazyWithRetry(() => import("@/pages/AIInsights"));
export const Chatbot = lazyWithRetry(() => import("@/pages/Chatbot"));

// ==================== نقطة البيع ====================
export const PointOfSale = lazyWithRetry(() => import("@/pages/PointOfSale"));
