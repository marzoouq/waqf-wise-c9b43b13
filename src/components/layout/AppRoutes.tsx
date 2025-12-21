/**
 * مكون المسارات المحمية والثانوية
 * يحتوي على GlobalErrorBoundary و AuthProvider و Sonner
 * ✅ يُحمَّل فقط للصفحات غير الترحيبية (Lazy loaded)
 */

import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { GlobalErrorBoundary } from "@/components/shared/GlobalErrorBoundary";

// ✅ Lazy load للصفحات
const AppShell = lazy(() => import("./AppShell"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Install = lazy(() => import("@/pages/Install"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("@/pages/TermsOfUse"));
const SecurityPolicyPage = lazy(() => import("@/pages/SecurityPolicy"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Contact = lazy(() => import("@/pages/Contact"));

// ✅ Fallback خفيف
const LightFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppRoutes = () => {
  console.log('📍 [AppRoutes] تحميل المسارات');
  
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <Sonner />
        {/* ✅ Suspense واحدة تغطي جميع المسارات - بدلاً من Suspense متعددة */}
        <Suspense fallback={<LightFallback />}>
          <Routes>
            {/* ✅ صفحات المصادقة - بدون Suspense إضافية */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* ✅ الصفحات العامة الثانوية - بدون Suspense إضافية */}
            <Route path="/install" element={<Install />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/security-policy" element={<SecurityPolicyPage />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* ✅ جميع المسارات المحمية */}
            <Route path="/*" element={<AppShell />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
};

export default AppRoutes;
