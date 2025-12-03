/**
 * المسارات العامة - لا تتطلب مصادقة
 * Public routes - no authentication required
 */

import { Route } from "react-router-dom";
import { Suspense } from "react";
// ✅ تحميل فوري للصفحة الترحيبية (أهم صفحة للأداء)
import LandingPageEager from "@/pages/LandingPage";
import {
  Login,
  Signup,
  Install,
  Unauthorized,
  PrivacyPolicy,
  TermsOfUse,
  SecurityPolicyPage,
  FAQ,
  Contact,
} from "./lazyPages";

// ✅ Fallback خفيف للصفحات الثانوية
const LightFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export const publicRoutes = [
  // ✅ الصفحة الترحيبية - تحميل فوري بدون Suspense
  <Route key="landing" path="/" element={<LandingPageEager />} />,
  
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
