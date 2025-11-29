/**
 * المكون الرئيسي للتطبيق
 * Main Application Component
 */

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { UpdateNotifier } from "./components/system/UpdateNotifier";
import { LCPOptimizer } from "./components/performance/LCPOptimizer";
import { CriticalResourceLoader } from "./components/performance/CriticalResourceLoader";
import "@/lib/errors/tracker";
import "@/lib/selfHealing";

// Import DevTools configuration
import { DEVTOOLS_CONFIG } from "./lib/devtools";

// Import routes
import { 
  publicRoutes, 
  beneficiaryStandaloneRoutes, 
  dashboardRoutes,
  adminRoutes,
  coreRoutes,
  beneficiaryProtectedRoutes,
} from "./routes";

// Lazy load React Query DevTools
const ReactQueryDevtools =
  DEVTOOLS_CONFIG.enabled
    ? lazy(() =>
        import("@tanstack/react-query-devtools")
          .then((d) => ({
            default: d.ReactQueryDevtools,
          }))
          .catch(() => {
            return { default: () => null };
          })
      )
    : null;

// Configure QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      structuralSharing: true,
      networkMode: 'online',
      retry: (failureCount, error: unknown) => {
        const errorObj = error && typeof error === 'object' ? error as { status?: number; message?: string } : {};
        if (errorObj.status === 404 || errorObj.status === 403) return false;
        if (errorObj.message?.includes('auth') || errorObj.message?.includes('credentials')) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * 2 ** attemptIndex, 4000);
      },
    },
    mutations: {
      retry: false,
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
                <LCPOptimizer />
                <GlobalMonitoring />
                <UpdateNotifier />
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <IdleTimeoutManager />
                  <CriticalResourceLoader />
                  <LazyErrorBoundary>
                    <Suspense fallback={<LoadingState size="lg" fullScreen />}>
                      <Routes>
                        {/* المسارات العامة */}
                        {publicRoutes}
                        
                        {/* صفحة التوجيه الذكي */}
                        <Route path="/redirect" element={<RoleBasedRedirect />} />
                        
                        {/* مسارات المستفيد المستقلة */}
                        {beneficiaryStandaloneRoutes}
                        
                        {/* المسارات المحمية داخل MainLayout */}
                        <Route
                          path="/*"
                          element={
                            <ProtectedRoute>
                              <MainLayout>
                                <Routes>
                                  {/* لوحات التحكم */}
                                  {dashboardRoutes}
                                  
                                  {/* مسارات الإدارة */}
                                  {adminRoutes}
                                  
                                  {/* مسارات المستفيد داخل MainLayout */}
                                  {beneficiaryProtectedRoutes}
                                  
                                  {/* المسارات الأساسية */}
                                  {coreRoutes}
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
              
              {/* React Query DevTools */}
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
