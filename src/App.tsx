import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "./components/layout/MainLayout";
import { GlobalErrorBoundary } from "./components/shared/GlobalErrorBoundary";
import { LoadingState } from "./components/shared/LoadingState";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { usePWAUpdate } from "./lib/pwa";

// Lazy load React Query DevTools (TanStack recommended pattern)
const ReactQueryDevtools =
  import.meta.env.DEV
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
const NotFound = lazy(() => import("./pages/NotFound"));

// Configure QueryClient with optimized defaults and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache retention (was cacheTime)
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnReconnect: true, // Refetch on reconnect
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
          <BrowserRouter>
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
                <Route path="/" element={<Dashboard />} />
                <Route path="/beneficiary-dashboard" element={<BeneficiaryDashboard />} />
                <Route path="/accountant-dashboard" element={<AccountantDashboard />} />
                <Route path="/nazer-dashboard" element={<NazerDashboard />} />
                <Route path="/cashier-dashboard" element={<CashierDashboard />} />
                <Route path="/archivist-dashboard" element={<ArchivistDashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/beneficiaries" element={<Beneficiaries />} />
                <Route path="/beneficiaries/:id" element={<BeneficiaryProfile />} />
                <Route path="/families" element={<Families />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/funds" element={<Funds />} />
                <Route path="/archive" element={<Archive />} />
                <Route path="/accounting" element={<Accounting />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/waqf-units" element={<WaqfUnits />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/staff/requests" element={<StaffRequests />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
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
      
        {/* React Query DevTools - Lazy loaded, only in development */}
        {import.meta.env.DEV && ReactQueryDevtools && (
          <Suspense fallback={null}>
            <ReactQueryDevtools 
              initialIsOpen={false}
              buttonPosition="bottom-right"
            />
          </Suspense>
        )}
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
