/**
 * المكون الرئيسي للتطبيق - محسّن للأداء
 * Main Application Component - Performance Optimized
 * 
 * ✅ الصفحة الترحيبية تُحمَّل بدون تبعيات ثقيلة (Radix UI, Sonner, etc.)
 * ✅ المكونات الثقيلة تُحمَّل فقط للصفحات المحمية
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { GlobalErrorBoundary } from "./components/shared/GlobalErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster as Sonner } from "@/components/ui/sonner";

// ✅ تحميل فوري للصفحة الترحيبية الخفيفة
import LandingPageLight from "@/pages/LandingPageLight";

// ✅ Lazy load للصفحات الثانوية والمحمية
const AppShell = lazy(() => import("./components/layout/AppShell"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Install = lazy(() => import("@/pages/Install"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("@/pages/TermsOfUse"));
const SecurityPolicyPage = lazy(() => import("@/pages/SecurityPolicy"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Contact = lazy(() => import("@/pages/Contact"));

// Configure QueryClient - تحسين التحديث المباشر
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
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            {/* ✅ AuthProvider يغطي جميع المسارات لحل مشكلة useAuth */}
            <AuthProvider>
              <Sonner />
              <Routes>
                {/* ✅ الصفحة الترحيبية - تحميل فوري بدون أي تبعيات ثقيلة */}
                <Route path="/" element={<LandingPageLight />} />
                
                {/* ✅ صفحات المصادقة - تحتاج AuthProvider */}
                <Route path="/login" element={<Suspense fallback={<LightFallback />}><Login /></Suspense>} />
                <Route path="/signup" element={<Suspense fallback={<LightFallback />}><Signup /></Suspense>} />
                
                {/* ✅ الصفحات العامة الثانوية - لا تحتاج AuthProvider لكن موجودة ضمنه */}
                <Route path="/install" element={<Suspense fallback={<LightFallback />}><Install /></Suspense>} />
                <Route path="/unauthorized" element={<Suspense fallback={<LightFallback />}><Unauthorized /></Suspense>} />
                <Route path="/privacy" element={<Suspense fallback={<LightFallback />}><PrivacyPolicy /></Suspense>} />
                <Route path="/terms" element={<Suspense fallback={<LightFallback />}><TermsOfUse /></Suspense>} />
                <Route path="/security-policy" element={<Suspense fallback={<LightFallback />}><SecurityPolicyPage /></Suspense>} />
                <Route path="/faq" element={<Suspense fallback={<LightFallback />}><FAQ /></Suspense>} />
                <Route path="/contact" element={<Suspense fallback={<LightFallback />}><Contact /></Suspense>} />
                
                {/* ✅ جميع المسارات المحمية - AppShell يحتوي على SettingsProvider, TooltipProvider */}
                <Route
                  path="/*"
                  element={
                    <Suspense fallback={<LightFallback />}>
                      <AppShell />
                    </Suspense>
                  }
                />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
