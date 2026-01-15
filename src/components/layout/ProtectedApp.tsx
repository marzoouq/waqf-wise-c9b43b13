/**
 * التطبيق المحمي - يتضمن AuthProvider
 * Protected App - Includes AuthProvider
 * 
 * ✅ يُحمّل فقط للمسارات المحمية
 * ✅ AuthProvider يُهيأ هنا فقط
 */

import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

// ✅ Lazy load للصفحات العامة
const Signup = lazy(() => import("@/pages/Signup"));
const Install = lazy(() => import("@/pages/Install"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("@/pages/TermsOfUse"));
const SecurityPolicyPage = lazy(() => import("@/pages/SecurityPolicy"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Contact = lazy(() => import("@/pages/Contact"));
const TenantPortal = lazy(() => import("@/pages/TenantPortal"));

// ✅ Lazy load للتطبيق الرئيسي المحمي
const AppShell = lazy(() => import("./AppShell"));

// ✅ Fallback خفيف
const LightFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function ProtectedApp() {
  return (
    <AuthProvider>
      <Suspense fallback={<LightFallback />}>
        <Routes>
          {/* صفحات عامة لا تحتاج حماية */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/install" element={<Install />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/security-policy" element={<SecurityPolicyPage />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/tenant-portal" element={<TenantPortal />} />
          
          {/* المسارات المحمية */}
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </Suspense>
      
      {/* Toasts */}
      <Toaster />
    </AuthProvider>
  );
}
