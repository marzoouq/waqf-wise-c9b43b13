import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "./components/layout/MainLayout";
import ErrorBoundary from "./components/shared/ErrorBoundary";
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
const Beneficiaries = lazy(() => import("./pages/Beneficiaries"));
const Properties = lazy(() => import("./pages/Properties"));
const Funds = lazy(() => import("./pages/Funds"));
const Archive = lazy(() => import("./pages/Archive"));
const Accounting = lazy(() => import("./pages/Accounting"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Approvals = lazy(() => import("./pages/Approvals"));
const Payments = lazy(() => import("./pages/Payments"));
const Install = lazy(() => import("./pages/Install"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Configure QueryClient with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache retention (was cacheTime)
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnReconnect: true, // Refetch on reconnect
      retry: 1, // Only retry once on failure
    },
  },
});

const App = () => {
  usePWAUpdate();
  
  return (
    <ErrorBoundary>
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
                        <Route path="/beneficiaries" element={<Beneficiaries />} />
                        <Route path="/properties" element={<Properties />} />
                        <Route path="/funds" element={<Funds />} />
                        <Route path="/archive" element={<Archive />} />
                        <Route path="/accounting" element={<Accounting />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="/approvals" element={<Approvals />} />
                        <Route path="/payments" element={<Payments />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/settings" element={<Settings />} />
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
    </ErrorBoundary>
  );
};

export default App;
