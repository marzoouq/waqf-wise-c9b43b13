/**
 * المسارات العامة - لا تتطلب مصادقة
 * Public routes - no authentication required
 */

import { Route } from "react-router-dom";
import { Suspense, lazy } from "react";

// ✅ تحميل فوري للصفحة الترحيبية الخفيفة (بدون Radix UI)
import LandingPageLight from "@/pages/LandingPageLight";

// ✅ Lazy loading للصفحات الثانوية
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Install = lazy(() => import("@/pages/Install"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("@/pages/TermsOfUse"));
const SecurityPolicyPage = lazy(() => import("@/pages/SecurityPolicy"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Contact = lazy(() => import("@/pages/Contact"));

// ✅ Fallback خفيف للصفحات الثانوية
const LightFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export const publicRoutes = [
  // ✅ الصفحة الترحيبية الخفيفة - تحميل فوري بدون Suspense
  <Route key="landing" path="/" element={<LandingPageLight />} />,
  
  // باقي الصفحات العامة مع Suspense خفيف
  <Route key="login" path="/login" element={<Suspense fallback={<LightFallback />}><Login /></Suspense>} />,
  <Route key="signup" path="/signup" element={<Suspense fallback={<LightFallback />}><Signup /></Suspense>} />,
  <Route key="install" path="/install" element={<Suspense fallback={<LightFallback />}><Install /></Suspense>} />,
  <Route key="unauthorized" path="/unauthorized" element={<Suspense fallback={<LightFallback />}><Unauthorized /></Suspense>} />,
  <Route key="privacy" path="/privacy" element={<Suspense fallback={<LightFallback />}><PrivacyPolicy /></Suspense>} />,
  <Route key="terms" path="/terms" element={<Suspense fallback={<LightFallback />}><TermsOfUse /></Suspense>} />,
  <Route key="security-policy" path="/security-policy" element={<Suspense fallback={<LightFallback />}><SecurityPolicyPage /></Suspense>} />,
  <Route key="faq" path="/faq" element={<Suspense fallback={<LightFallback />}><FAQ /></Suspense>} />,
  <Route key="contact" path="/contact" element={<Suspense fallback={<LightFallback />}><Contact /></Suspense>} />,
];
