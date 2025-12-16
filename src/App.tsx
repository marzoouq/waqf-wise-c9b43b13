/**
 * المكون الرئيسي للتطبيق - محسّن للأداء
 * Main Application Component - Performance Optimized
 * 
 * ✅ الصفحة الترحيبية تُحمَّل بدون AuthProvider أو Sonner أو GlobalErrorBoundary
 * ✅ المكونات الثقيلة تُحمَّل فقط للصفحات المحمية
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";

// ✅ استيراد خفيف للصفحة الترحيبية (بدون Radix UI)
import LandingPageLight from "@/pages/LandingPageLight";
import { LightErrorBoundary } from "./components/shared/LightErrorBoundary";

// ✅ Lazy load لباقي المسارات (تحتوي على GlobalErrorBoundary و AuthProvider و Sonner)
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* ✅ الصفحة الترحيبية - مع LightErrorBoundary فقط (بدون Radix UI) */}
            <Route 
              path="/" 
              element={
                <LightErrorBoundary>
                  <LandingPageLight />
                </LightErrorBoundary>
              } 
            />
            
            {/* ✅ باقي المسارات - مع GlobalErrorBoundary و AuthProvider و Sonner */}
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
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
