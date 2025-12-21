/**
 * مكون المسارات المحمية والثانوية
 * ✅ AuthProvider موجود في App.tsx - لا حاجة لإعادته هنا
 */

import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
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
  return (
    <GlobalErrorBoundary>
      {/* ✅ AuthProvider أُزيل - موجود الآن في App.tsx */}
      <Sonner />
      <Suspense fallback={<LightFallback />}>
        <Routes>
          {/* صفحات المصادقة */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* الصفحات العامة */}
          <Route path="/install" element={<Install />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/security-policy" element={<SecurityPolicyPage />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* المسارات المحمية */}
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </Suspense>
    </GlobalErrorBoundary>
  );
};

export default AppRoutes;
