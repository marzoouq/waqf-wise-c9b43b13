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
// ✅ نقل التهيئة الثقيلة إلى MainLayout للصفحات المحمية فقط

// Import routes
import { 
  publicRoutes, 
  beneficiaryStandaloneRoutes, 
  dashboardRoutes,
  adminRoutes,
  coreRoutes,
  beneficiaryProtectedRoutes,
} from "./routes";

// Configure QueryClient - تحسين التحديث المباشر
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 دقائق بدلاً من 5 للتحديث الأسرع
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true, // ✅ تفعيل التحديث عند العودة للنافذة
      refetchOnReconnect: true,
      refetchOnMount: true, // ✅ تفعيل التحديث عند mount
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
  // ✅ useAlertCleanup نُقل إلى MainLayout
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <SettingsProvider>
              <TooltipProvider>
                <Sonner />
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <LazyErrorBoundary>
                    <Routes>
                      {/* ✅ المسارات العامة - بدون Suspense للتحميل الفوري */}
                      {publicRoutes}
                      
                      {/* صفحة التوجيه الذكي */}
                      <Route path="/redirect" element={<RoleBasedRedirect />} />
                      
                      {/* مسارات المستفيد المستقلة */}
                      {beneficiaryStandaloneRoutes}
                      
                      {/* ✅ المسارات المحمية داخل Suspense */}
                      <Route
                        path="/*"
                        element={
                          <Suspense fallback={<LoadingState size="lg" fullScreen />}>
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
                          </Suspense>
                        }
                      />
                    </Routes>
                  </LazyErrorBoundary>
                </BrowserRouter>
              </TooltipProvider>
              
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
