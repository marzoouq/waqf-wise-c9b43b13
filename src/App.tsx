import { Toaster } from "@/components/ui/toaster";
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
import { LoadingState } from "./components/shared/LoadingState";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { usePWAUpdate } from "./lib/pwa";
import "@/lib/errors/tracker";
import "@/lib/selfHealing";

// Import DevTools configuration
import { DEVTOOLS_CONFIG } from "./lib/devtools";

// Lazy load React Query DevTools (TanStack v5 pattern)
const ReactQueryDevtools =
  DEVTOOLS_CONFIG.enabled
    ? lazy(() =>
        import("@tanstack/react-query-devtools").then((d) => ({
          default: d.ReactQueryDevtools,
        }))
      )
    : null;

// Lazy load pages for better performance
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BeneficiaryDashboard = lazy(() => import("./pages/BeneficiaryDashboard"));
const BeneficiarySupport = lazy(() => import("./pages/BeneficiarySupport"));
const AccountantDashboard = lazy(() => import("./pages/AccountantDashboard"));
const NazerDashboard = lazy(() => import("./pages/NazerDashboard"));
const CashierDashboard = lazy(() => import("./pages/CashierDashboard"));
const ArchivistDashboard = lazy(() => import("./pages/ArchivistDashboard"));
const Beneficiaries = lazy(() => import("./pages/Beneficiaries"));
const BeneficiaryProfile = lazy(() => import("./pages/BeneficiaryProfile"));
const Properties = lazy(() => import("./pages/Properties"));
// PropertyUnits page removed - integrated into Properties page
const Funds = lazy(() => import("./pages/Funds"));
const Archive = lazy(() => import("./pages/Archive"));
const Accounting = lazy(() => import("./pages/Accounting"));
const Budgets = lazy(() => import("./pages/Budgets"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const TransparencySettings = lazy(() => import("./pages/TransparencySettings"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Approvals = lazy(() => import("./pages/Approvals"));
const Payments = lazy(() => import("./pages/Payments"));
const Loans = lazy(() => import("./pages/Loans"));
const PaymentVouchers = lazy(() => import("./pages/PaymentVouchers"));
const WaqfUnits = lazy(() => import("./pages/WaqfUnits"));
const Install = lazy(() => import("./pages/Install"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Requests = lazy(() => import("./pages/Requests"));
const StaffRequests = lazy(() => import("./pages/StaffRequests"));
const Families = lazy(() => import("./pages/Families"));
const Users = lazy(() => import("./pages/Users"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const AIInsights = lazy(() => import("./pages/AIInsights"));
const Chatbot = lazy(() => import("./pages/Chatbot"));
const Support = lazy(() => import("./pages/Support"));
const SupportManagement = lazy(() => import("./pages/SupportManagement"));
const SystemErrorLogs = lazy(() => import("./pages/SystemErrorLogs"));
const SystemMonitoring = lazy(() => import("./pages/SystemMonitoring"));
const SystemTesting = lazy(() => import("./pages/SystemTesting"));
const AdvancedSettings = lazy(() => import("./pages/AdvancedSettings"));
const SystemMaintenance = lazy(() => import("./pages/SystemMaintenance"));
const AllTransactions = lazy(() => import("./pages/AllTransactions"));
const BeneficiaryPortal = lazy(() => import("./pages/BeneficiaryPortal"));
const BankTransfers = lazy(() => import("./pages/BankTransfers"));
const Messages = lazy(() => import("./pages/Messages"));
const GovernanceDecisions = lazy(() => import("./pages/GovernanceDecisions"));
const DecisionDetails = lazy(() => import("./pages/DecisionDetails"));
const RolesManagement = lazy(() => import("./pages/RolesManagement"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const TestPhase3 = lazy(() => import("./pages/TestPhase3"));
const TestPhase4 = lazy(() => import("./pages/TestPhase4"));
const TestPhase5 = lazy(() => import("./pages/TestPhase5"));
const TestPhase6 = lazy(() => import("./pages/TestPhase6"));
const TestPhase7 = lazy(() => import("./pages/TestPhase7"));
const TestDataManager = lazy(() => import("./pages/TestDataManager"));
const DeveloperGuide = lazy(() => import("./pages/DeveloperGuide"));
const DesignPreview = lazy(() => import("./pages/DesignPreview"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
  usePWAUpdate();
  
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <SettingsProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
            <Suspense fallback={<LoadingState size="lg" fullScreen />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/install" element={<Install />} />
                
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
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
            <Route path="/design-preview" element={<DesignPreview />} />
            <Route path="/transparency-settings" element={<TransparencySettings />} />
          <Route 
            path="/settings/roles" 
            element={
              <ProtectedRoute requiredRoles={["admin", "nazer"]}>
                <RolesManagement />
              </ProtectedRoute>
            } 
          />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/staff/requests" element={<StaffRequests />} />
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
            path="/system-errors" 
            element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <SystemErrorLogs />
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
                
                {/* Testing Pages */}
                <Route 
                  path="/test-phase3" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <TestPhase3 />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/test-phase4" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <TestPhase4 />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/test-phase5" 
                  element={
                    <TestPhase5 />
                  } 
                />
                <Route 
                  path="/test-phase6" 
                  element={
                    <TestPhase6 />
                  } 
                />
                <Route 
                  path="/test-phase7" 
                  element={
                    <TestPhase7 />
                  } 
                />
                <Route 
                  path="/test-data-manager" 
                  element={
                    <TestDataManager />
                  } 
                />
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
