import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "./components/layout/MainLayout";
import { GlobalErrorBoundary } from "./components/shared/GlobalErrorBoundary";
import { LoadingState } from "./components/shared/LoadingState";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { usePWAUpdate } from "./lib/pwa";

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
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BeneficiaryDashboard = lazy(() => import("./pages/BeneficiaryDashboard"));
const AccountantDashboard = lazy(() => import("./pages/AccountantDashboard"));
const NazerDashboard = lazy(() => import("./pages/NazerDashboard"));
const CashierDashboard = lazy(() => import("./pages/CashierDashboard"));
const ArchivistDashboard = lazy(() => import("./pages/ArchivistDashboard"));
const Beneficiaries = lazy(() => import("./pages/Beneficiaries"));
const BeneficiaryProfile = lazy(() => import("./pages/BeneficiaryProfile"));
const Properties = lazy(() => import("./pages/Properties"));
const Funds = lazy(() => import("./pages/Funds"));
const Archive = lazy(() => import("./pages/Archive"));
const Accounting = lazy(() => import("./pages/Accounting"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Approvals = lazy(() => import("./pages/Approvals"));
const Payments = lazy(() => import("./pages/Payments"));
const Loans = lazy(() => import("./pages/Loans"));
const WaqfUnits = lazy(() => import("./pages/WaqfUnits"));
const Install = lazy(() => import("./pages/Install"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Requests = lazy(() => import("./pages/Requests"));
const StaffRequests = lazy(() => import("./pages/StaffRequests"));
const Families = lazy(() => import("./pages/Families"));
const Users = lazy(() => import("./pages/Users"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const AIInsights = lazy(() => import("./pages/AIInsights"));
const ReportBuilder = lazy(() => import("./pages/ReportBuilder"));
const Chatbot = lazy(() => import("./pages/Chatbot"));
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
      retry: (failureCount, error: any) => {
        // لا تعيد المحاولة على أخطاء 404 أو 403
        if (error?.status === 404 || error?.status === 403) return false;
        // لا تعيد المحاولة على أخطاء المصادقة
        if (error?.message?.includes('auth') || error?.message?.includes('credentials')) return false;
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
                <Route path="/auth" element={<Auth />} />
                <Route path="/install" element={<Install />} />
              
              {/* Protected routes */}
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
          <Route 
            path="/beneficiary-dashboard" 
            element={
              <ProtectedRoute requiredRole="beneficiary">
                <BeneficiaryDashboard />
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
          <Route path="/waqf-units" element={<WaqfUnits />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/report-builder" element={<ReportBuilder />} />
          <Route path="/settings" element={<Settings />} />
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
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
