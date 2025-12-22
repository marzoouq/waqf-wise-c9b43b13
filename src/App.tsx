/**
 * المكون الرئيسي للتطبيق - محسّن للأداء
 * Main Application Component - Performance Optimized
 * 
 * ✅ AuthProvider يغلف كل شيء - متاح دائماً
 * ✅ لا إعادة تهيئة عند التنقل بين الصفحات
 * ✅ نظام إشعار التحديثات التلقائي
 * ✅ SEO مع react-helmet-async
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";

// ✅ استيراد خفيف للصفحة الترحيبية (بدون Radix UI)
import LandingPageLight from "@/pages/LandingPageLight";
import { LightErrorBoundary } from "./components/shared/LightErrorBoundary";
import { UpdateNotification } from "./components/shared/UpdateNotification";

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
          
          {/* ✅ إشعار التحديث المتاح */}
          <UpdateNotification />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
