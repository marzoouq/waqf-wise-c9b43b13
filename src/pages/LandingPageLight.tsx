/**
 * صفحة ترحيبية خفيفة
 * ✅ تستخدم useAuth مباشرة لأن AuthProvider متاح في App.tsx
 * ✅ تم تقسيمها إلى مكونات صغيرة في src/components/landing-light
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/shared/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import {
  LightHeader,
  LightHeroSection,
  LightFeaturesSection,
  LightStatsSection,
  LightHowItWorksSection,
  LightCTASection,
  LightFooter,
} from "@/components/landing-light";

export default function LandingPageLight() {
  const { user, isLoading, roles } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // تحديد المسار بناءً على الأدوار
  const getRedirectPath = () => {
    if (roles.includes('admin')) return '/admin';
    if (roles.includes('nazer')) return '/nazer';
    if (roles.includes('accountant')) return '/accountant';
    if (roles.includes('cashier')) return '/cashier';
    if (roles.includes('archivist')) return '/archive';
    if (roles.includes('waqf_heir') || roles.includes('beneficiary')) return '/beneficiary';
    return '/dashboard';
  };

  // ✅ توجيه تلقائي للمستخدمين المسجلين
  useEffect(() => {
    if (isLoading) return;
    
    if (user) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        navigate(getRedirectPath(), { replace: true });
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, roles, navigate]);

  // ✅ عرض spinner أثناء التوجيه
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
      <SEOHead 
        title="الصفحة الرئيسية"
        description="منصة متكاملة لإدارة الأوقاف والمستفيدين - نظام حديث لإدارة العقارات والتوزيعات والمحاسبة"
      />
      
      {/* Skip to main content */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        تخطي إلى المحتوى الرئيسي
      </a>

      <LightHeader />

      <main id="main-content" role="main">
        <LightHeroSection />
        <LightFeaturesSection />
        <LightStatsSection />
        <LightHowItWorksSection />
        <LightCTASection />
      </main>

      <LightFooter />
    </div>
  );
}
