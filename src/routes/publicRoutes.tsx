/**
 * المسارات العامة - لا تتطلب مصادقة
 * Public routes - no authentication required
 */

import { Route } from "react-router-dom";
import {
  LandingPage,
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

export const publicRoutes = [
  <Route key="landing" path="/" element={<LandingPage />} />,
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="signup" path="/signup" element={<Signup />} />,
  <Route key="install" path="/install" element={<Install />} />,
  <Route key="unauthorized" path="/unauthorized" element={<Unauthorized />} />,
  <Route key="privacy" path="/privacy" element={<PrivacyPolicy />} />,
  <Route key="terms" path="/terms" element={<TermsOfUse />} />,
  <Route key="security-policy" path="/security-policy" element={<SecurityPolicyPage />} />,
  <Route key="faq" path="/faq" element={<FAQ />} />,
  <Route key="contact" path="/contact" element={<Contact />} />,
];
