/**
 * المكون الرئيسي للتطبيق - محسّن للأداء (v3.0)
 * Main Application Component - Performance Optimized
 * 
 * ✅ صفحات الدخول خفيفة ومستقلة عن AuthProvider
 * ✅ AuthProvider يُحمّل فقط للمسارات المحمية
 * ✅ LCP محسّن بشكل جذري
 * ✅ نظام إشعار التحديثات التلقائي
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { initializeAppearanceSettings } from "@/components/settings/AppearanceSettingsDialog";
import { initializeSupabaseInterceptor } from "@/integrations/supabase/request-interceptor";
import { queryInvalidationManager } from "@/lib/query-invalidation-manager";

// ✅ تطبيق إعدادات المظهر المحفوظة فوراً
initializeAppearanceSettings();

// ✅ تهيئة مراقب الاتصال
initializeSupabaseInterceptor();

// ✅ استيراد خفيف للصفحات الأولية (بدون AuthContext)
import LandingPageLight from "@/pages/LandingPageLight";
import LoginLight from "@/pages/LoginLight";
import { LightErrorBoundary } from "./components/shared/LightErrorBoundary";
import { UpdateNotification } from "./components/shared/UpdateNotification";

// ✅ Lazy load للمسارات المحمية (تحتاج AuthProvider)
const ProtectedApp = lazy(() => import("./components/layout/ProtectedApp"));

// Configure QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      structuralSharing: true,
      networkMode: 'online',
      retry: (failureCount, error: unknown) => {
        const errorObj = error && typeof error === 'object' ? error as { status?: number; message?: string } : {};
        if (errorObj.status === 404 || errorObj.status === 403) return false;
        if (errorObj.message?.includes('auth') || errorObj.message?.includes('credentials')) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 4000),
    },
    mutations: {
      retry: false,
    },
  },
});

// ✅ تهيئة QueryInvalidationManager
queryInvalidationManager.setQueryClient(queryClient);

// ✅ Fallback خفيف جداً
const LightFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <BrowserRouter>
            <Routes>
              {/* ✅ الصفحة الترحيبية - خفيفة */}
              <Route 
                path="/" 
                element={
                  <LightErrorBoundary>
                    <LandingPageLight />
                  </LightErrorBoundary>
                } 
              />
              
              {/* ✅ صفحة تسجيل الدخول - خفيفة ومستقلة */}
              <Route 
                path="/login" 
                element={
                  <LightErrorBoundary>
                    <LoginLight />
                  </LightErrorBoundary>
                } 
              />
              
              {/* ✅ باقي المسارات (تحتاج AuthProvider) */}
              <Route
                path="/*"
                element={
                  <Suspense fallback={<LightFallback />}>
                    <ProtectedApp />
                  </Suspense>
                }
              />
            </Routes>
          </BrowserRouter>

          {/* ✅ إشعار التحديث المتاح */}
          <UpdateNotification />
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
