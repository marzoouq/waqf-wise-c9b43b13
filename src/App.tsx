import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import { GlobalErrorBoundary } from "./components/shared/GlobalErrorBoundary";
import { LazyErrorBoundary } from "./components/shared/LazyErrorBoundary";
import { LoadingState } from "./components/shared/LoadingState";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleBasedRedirect } from "./components/auth/RoleBasedRedirect";
import { GlobalMonitoring } from "./components/developer/GlobalMonitoring";
import { IdleTimeoutManager } from "./components/auth/IdleTimeoutManager";
import { useAlertCleanup } from "./hooks/useAlertCleanup";
import { lazyWithRetry } from "./lib/lazyWithRetry";
import { UpdateNotifier } from "./components/system/UpdateNotifier";
import "@/lib/errors/tracker";
import "@/lib/selfHealing";

// Import DevTools configuration
import { DEVTOOLS_CONFIG } from "./lib/devtools";

// Lazy load React Query DevTools (TanStack v5 pattern)
const ReactQueryDevtools =
  DEVTOOLS_CONFIG.enabled
    ? lazy(() =>
        import("@tanstack/react-query-devtools")
          .then((d) => ({
            default: d.ReactQueryDevtools,
          }))
          .catch((err) => {
            // DevTools تحميل فاشل - يمكن تجاهله في التطوير
            return { default: () => null };
          })
      )
    : null;

// Lazy load pages with retry mechanism for better reliability
// Using lazyWithRetry for critical pages, standard lazy for less critical ones
const LandingPage = lazyWithRetry(() => import("./pages/LandingPage"));
const Login = lazyWithRetry(() => import("./pages/Login"));
const Signup = lazyWithRetry(() => import("./pages/Signup"));
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const BeneficiaryDashboard = lazyWithRetry(() => import("./pages/BeneficiaryDashboard"));
const BeneficiarySupport = lazyWithRetry(() => import("./pages/BeneficiarySupport"));
const AccountantDashboard = lazyWithRetry(() => import("./pages/AccountantDashboard"));
const NazerDashboard = lazyWithRetry(() => import("./pages/NazerDashboard"));
const AdminDashboard = lazyWithRetry(() => import("./pages/AdminDashboard"));
const CashierDashboard = lazyWithRetry(() => import("./pages/CashierDashboard"));
const ArchivistDashboard = lazyWithRetry(() => import("./pages/ArchivistDashboard"));
const Beneficiaries = lazyWithRetry(() => import("./pages/Beneficiaries"));
const BeneficiaryProfile = lazyWithRetry(() => import("./pages/BeneficiaryProfile"));
const Properties = lazyWithRetry(() => import("./pages/Properties"));
const Funds = lazyWithRetry(() => import("./pages/Funds"));
const Archive = lazyWithRetry(() => import("./pages/Archive"));
const Accounting = lazyWithRetry(() => import("./pages/Accounting"));
const Budgets = lazyWithRetry(() => import("./pages/Budgets"));
const Reports = lazyWithRetry(() => import("./pages/Reports"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const TransparencySettings = lazyWithRetry(() => import("./pages/TransparencySettings"));
const Invoices = lazyWithRetry(() => import("./pages/Invoices"));
const Approvals = lazyWithRetry(() => import("./pages/Approvals"));
const Payments = lazyWithRetry(() => import("./pages/Payments"));
const Loans = lazyWithRetry(() => import("./pages/Loans"));
const PaymentVouchers = lazyWithRetry(() => import("./pages/PaymentVouchers"));
const WaqfUnits = lazyWithRetry(() => import("./pages/WaqfUnits"));
const Install = lazyWithRetry(() => import("./pages/Install"));
const Notifications = lazyWithRetry(() => import("./pages/Notifications"));
const Requests = lazyWithRetry(() => import("./pages/Requests"));
const BeneficiaryRequests = lazyWithRetry(() => import("./pages/BeneficiaryRequests"));
const BeneficiaryAccountStatement = lazyWithRetry(() => import("./pages/BeneficiaryAccountStatement"));
const BeneficiaryReports = lazyWithRetry(() => import("./pages/BeneficiaryReports"));
const StaffRequestsManagement = lazyWithRetry(() => import("./pages/StaffRequestsManagement"));
const EmergencyAidManagement = lazyWithRetry(() => import("./pages/EmergencyAidManagement"));
const NotificationSettingsPage = lazyWithRetry(() => import("./pages/NotificationSettings"));
const CustomReportsPage = lazyWithRetry(() => import("./pages/CustomReports"));
const IntegrationsManagement = lazyWithRetry(() => import("./pages/IntegrationsManagement"));
const SecurityDashboard = lazyWithRetry(() => import("./pages/SecurityDashboard"));
const PerformanceDashboard = lazyWithRetry(() => import("./pages/PerformanceDashboard"));
const Families = lazyWithRetry(() => import("./pages/Families"));
const FamilyDetails = lazyWithRetry(() => import("./pages/FamilyDetails"));
const Users = lazyWithRetry(() => import("./pages/Users"));
const AuditLogs = lazyWithRetry(() => import("./pages/AuditLogs"));
const AIInsights = lazyWithRetry(() => import("./pages/AIInsights"));
const Chatbot = lazyWithRetry(() => import("./pages/Chatbot"));
const Support = lazyWithRetry(() => import("./pages/Support"));
const SupportManagement = lazyWithRetry(() => import("./pages/SupportManagement"));
const SystemErrorLogs = lazyWithRetry(() => import("./pages/SystemErrorLogs"));
const SystemMonitoring = lazyWithRetry(() => import("./pages/SystemMonitoring"));
const SystemTesting = lazyWithRetry(() => import("./pages/SystemTesting"));
const AdvancedSettings = lazyWithRetry(() => import("./pages/AdvancedSettings"));
const SystemMaintenance = lazyWithRetry(() => import("./pages/SystemMaintenance"));
const AllTransactions = lazyWithRetry(() => import("./pages/AllTransactions"));
const BeneficiaryPortal = lazyWithRetry(() => import("./pages/BeneficiaryPortal"));
const BankTransfers = lazyWithRetry(() => import("./pages/BankTransfers"));
const Messages = lazyWithRetry(() => import("./pages/Messages"));
const GovernanceDecisions = lazyWithRetry(() => import("./pages/GovernanceDecisions"));
const DecisionDetails = lazyWithRetry(() => import("./pages/DecisionDetails"));
const RolesManagement = lazyWithRetry(() => import("./pages/RolesManagement"));
const KnowledgeBase = lazyWithRetry(() => import("./pages/KnowledgeBase"));
const PermissionsManagement = lazyWithRetry(() => import("./pages/PermissionsManagement"));
const Unauthorized = lazyWithRetry(() => import("./pages/Unauthorized"));
const DeveloperGuide = lazyWithRetry(() => import("./pages/DeveloperGuide"));
const DeveloperTools = lazyWithRetry(() => import("./pages/DeveloperTools"));
const ProjectDocumentation = lazyWithRetry(() => import("./pages/ProjectDocumentation"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));

// Configure QueryClient with optimized defaults and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache retention (was cacheTime)
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnReconnect: true, // Refetch on reconnect
      refetchOnMount: false, // Prevent unnecessary refetches on mount
      structuralSharing: true, // Optimize performance
      networkMode: 'online', // Handle connection state
      retry: (failureCount, error: unknown) => {
        const errorObj = error && typeof error === 'object' ? error as { status?: number; message?: string } : {};
        // لا تعيد المحاولة على أخطاء 404 أو 403
        if (errorObj.status === 404 || errorObj.status === 403) return false;
        // لا تعيد المحاولة على أخطاء المصادقة
        if (errorObj.message?.includes('auth') || errorObj.message?.includes('credentials')) return false;
        // أعد المحاولة 3 مرات للأخطاء الأخرى
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(1000 * 2 ** attemptIndex, 4000);
      },
    },
    mutations: {
      retry: false, // لا تعيد محاولة العمليات التي تغير البيانات
    },
  },
});

const App = () => {
  useAlertCleanup();
  
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <SettingsProvider>
              <TooltipProvider>
                <Sonner />
                {/* Global monitoring for admins only */}
                <GlobalMonitoring />
                {/* Update notifier for PWA */}
                <UpdateNotifier />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                {/* Auto logout after 1 minute of inactivity (except nazer & admin) */}
                <IdleTimeoutManager />
            <LazyErrorBoundary>
            <Suspense fallback={<LoadingState size="lg" fullScreen />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/install" element={<Install />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* صفحة التوجيه الذكي - تحدد لوحة التحكم حسب الدور */}
                <Route path="/redirect" element={<RoleBasedRedirect />} />
                
                {/* Beneficiary Dashboard - مستقل خارج MainLayout */}
                <Route 
                  path="/beneficiary-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="beneficiary">
                      <BeneficiaryDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/beneficiary-support" 
                  element={
                    <ProtectedRoute requiredRole="beneficiary">
                      <BeneficiarySupport />
                    </ProtectedRoute>
                  } 
                />
              
              {/* Protected routes with MainLayout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout>
              <Routes>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* لوحات التحكم المحمية حسب الأدوار */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route 
            path="/nazer-dashboard" 
            element={
              <ProtectedRoute requiredRole="nazer">
                <NazerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/accountant-dashboard" 
            element={
              <ProtectedRoute requiredRole="accountant">
                <AccountantDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cashier-dashboard" 
            element={
              <ProtectedRoute requiredRole="cashier">
                <CashierDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/archivist-dashboard" 
            element={
              <ProtectedRoute requiredRole="archivist">
                <ArchivistDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* الصفحات المحمية بصلاحيات متعددة */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer"]}>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/beneficiaries" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
                <Beneficiaries />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/beneficiaries/:id" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant", "beneficiary"]}>
                <BeneficiaryProfile />
              </ProtectedRoute>
            } 
          />
          <Route path="/families" element={<Families />} />
          <Route 
            path="/families/:id" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
                <FamilyDetails />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/properties" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
                <Properties />
              </ProtectedRoute>
            } 
          />
          <Route path="/funds" element={<Funds />} />
          <Route 
            path="/archive" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "archivist"]}>
                <Archive />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/accounting" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
                <Accounting />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/budgets" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
                <Budgets />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoices" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
                <Invoices />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/approvals" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
                <Approvals />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payments" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant", "cashier", "beneficiary"]}>
                <Payments />
              </ProtectedRoute>
            } 
          />
          <Route path="/loans" element={<Loans />} />
          <Route 
            path="/integrations" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer"]}>
                <IntegrationsManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/security" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer"]}>
                <SecurityDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/performance" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer"]}>
                <PerformanceDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment-vouchers" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant", "cashier"]}>
                <PaymentVouchers />
              </ProtectedRoute>
            } 
          />
          <Route path="/waqf-units" element={<WaqfUnits />} />
          <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route 
              path="/developer-guide" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <DeveloperGuide />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/developer-tools" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <DeveloperTools />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project-documentation" 
              element={
                <ProtectedRoute requiredRoles={["admin", "nazer"]}>
                  <ProjectDocumentation />
                </ProtectedRoute>
              } 
            />
            {/* صفحة DesignPreview محذوفة للإنتاج */}
            <Route path="/transparency-settings" element={<TransparencySettings />} />
          <Route 
            path="/settings/roles" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer"]}>
                <RolesManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings/permissions" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer"]}>
                <PermissionsManagement />
              </ProtectedRoute>
            } 
          />
          <Route path="/notifications" element={<Notifications />} />
          <Route 
            path="/beneficiary/requests" 
            element={
              <ProtectedRoute requiredRole="beneficiary">
                <BeneficiaryRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/beneficiary/account-statement" 
            element={
              <ProtectedRoute requiredRole="beneficiary">
                <BeneficiaryAccountStatement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/beneficiary/reports" 
            element={
              <ProtectedRoute requiredRole="beneficiary">
                <BeneficiaryReports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/requests" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
                <StaffRequestsManagement />
              </ProtectedRoute>
            } 
          />
          <Route path="/requests" element={<Requests />} />
          <Route 
            path="/emergency-aid" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
                <EmergencyAidManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications/settings" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant", "cashier", "beneficiary"]}>
                <NotificationSettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/custom" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
                <CustomReportsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/audit-logs" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer"]}>
                <AuditLogs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai-insights" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer"]}>
                <AIInsights />
              </ProtectedRoute>
            } 
          />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/support" element={<Support />} />
          <Route 
            path="/support-management" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer"]}>
                <SupportManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/system-error-logs" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer"]}>
                <SystemErrorLogs />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/advanced-settings" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdvancedSettings />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/system-maintenance" 
            element={
              <ProtectedRoute requiredRole="admin">
                <SystemMaintenance />
              </ProtectedRoute>
            } 
          />
          <Route path="/all-transactions" element={<AllTransactions />} />
                {/* Governance Routes */}
                <Route 
                  path="/governance/decisions" 
                  element={
                    <ProtectedRoute requiredRoles={["admin", "nazer", "beneficiary"]}>
                      <GovernanceDecisions />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/governance/decisions/:id" 
                  element={
                    <ProtectedRoute requiredRoles={["admin", "nazer", "beneficiary"]}>
                      <DecisionDetails />
                    </ProtectedRoute>
                  } 
                />
                
                {/* System Monitoring */}
                <Route 
                  path="/system-monitoring" 
                  element={
                    <ProtectedRoute requiredRoles={["admin", "nazer"]}>
                      <SystemMonitoring />
                    </ProtectedRoute>
                  } 
                />
                
                {/* System Testing */}
                <Route 
                  path="/system-testing" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <SystemTesting />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Knowledge Base */}
                <Route path="/knowledge-base" element={<KnowledgeBase />} />
                
                {/* صفحات الاختبار محذوفة للإنتاج */}
                <Route 
                  path="/developer-guide" 
                  element={
                    <DeveloperGuide />
                  } 
                />
                
                <Route
                  path="/beneficiary-portal"
                  element={
                    <ProtectedRoute requiredRole="beneficiary">
                      <BeneficiaryPortal />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/messages" 
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bank-transfers" 
                  element={
                    <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
                      <BankTransfers />
                    </ProtectedRoute>
                  } 
                />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
            </LazyErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
      
      {/* React Query DevTools - مفعّل على كامل التطبيق في بيئة التطوير */}
      {DEVTOOLS_CONFIG.enabled && ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools 
            initialIsOpen={DEVTOOLS_CONFIG.initialIsOpen}
          />
        </Suspense>
      )}
      </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
