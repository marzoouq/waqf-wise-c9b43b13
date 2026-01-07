/**
 * المكون الرئيسي للتطبيق - محسّن للأداء
 * Main Application Component - Performance Optimized
 * 
 * ✅ AuthProvider يغلف كل شيء - متاح دائماً
 * ✅ لا إعادة تهيئة عند التنقل بين الصفحات
 * ✅ نظام إشعار التحديثات التلقائي
 * ✅ SEO مع react-helmet-async
 * ✅ مراقبة الاتصال الشاملة
 * ✅ مراقبة قنوات Realtime
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { initializeAppearanceSettings } from "@/components/settings/AppearanceSettingsDialog";
import { initializeSupabaseInterceptor } from "@/integrations/supabase/request-interceptor";
import { queryInvalidationManager } from "@/lib/query-invalidation-manager";
import { realtimeManager } from "@/services/realtime-manager";

// ✅ تطبيق إعدادات المظهر المحفوظة فوراً
initializeAppearanceSettings();

// ✅ تهيئة مراقب الاتصال
initializeSupabaseInterceptor();

// ✅ استيراد خفيف للصفحة الترحيبية (بدون Radix UI)
import LandingPageLight from "@/pages/LandingPageLight";
import { LightErrorBoundary } from "./components/shared/LightErrorBoundary";
import { UpdateNotification } from "./components/shared/UpdateNotification";
import { Toaster } from "@/components/ui/toaster";

// ✅ Lazy load لباقي المسارات
const AppRoutes = lazy(() => import("./components/layout/AppRoutes"));

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
        {/* ✅ AuthProvider يغلف كل شيء - يُهيأ مرة واحدة فقط */}
        <AuthProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* ✅ الصفحة الترحيبية */}
              <Route 
                path="/" 
                element={
                  <LightErrorBoundary>
                    <LandingPageLight />
                  </LightErrorBoundary>
                } 
              />
              
              {/* ✅ باقي المسارات */}
              <Route
                path="/*"
                element={
                  <Suspense fallback={<LightFallback />}>
                    <AppRoutes />
                  </Suspense>
                }
              />
            </Routes>
          </BrowserRouter>

          {/* ✅ Toasts (رسائل النجاح/الخطأ) */}
          <Toaster />
          
          {/* ✅ إشعار التحديث المتاح */}
          <UpdateNotification />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
