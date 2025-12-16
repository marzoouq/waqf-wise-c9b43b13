/**
 * مكون المسارات المحمية والثانوية
 * يحتوي على AuthProvider و Sonner فقط للصفحات التي تحتاجها
 */

import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster as Sonner } from "@/components/ui/sonner";

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
  return (
    <AuthProvider>
      <Sonner />
      <Routes>
        {/* ✅ صفحات المصادقة */}
        <Route path="/login" element={<Suspense fallback={<LightFallback />}><Login /></Suspense>} />
        <Route path="/signup" element={<Suspense fallback={<LightFallback />}><Signup /></Suspense>} />
        
        {/* ✅ الصفحات العامة الثانوية */}
        <Route path="/install" element={<Suspense fallback={<LightFallback />}><Install /></Suspense>} />
        <Route path="/unauthorized" element={<Suspense fallback={<LightFallback />}><Unauthorized /></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<LightFallback />}><PrivacyPolicy /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<LightFallback />}><TermsOfUse /></Suspense>} />
        <Route path="/security-policy" element={<Suspense fallback={<LightFallback />}><SecurityPolicyPage /></Suspense>} />
        <Route path="/faq" element={<Suspense fallback={<LightFallback />}><FAQ /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<LightFallback />}><Contact /></Suspense>} />
        
        {/* ✅ جميع المسارات المحمية */}
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
  );
};

export default AppRoutes;
