/**
 * صفحة ترحيبية خفيفة - محسّنة للأداء
 * ✅ لا تعتمد على AuthContext عند التحميل الأولي
 * ✅ تفحص الجلسة مباشرة من Supabase
 * ✅ LCP محسّن بشكل جذري
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/shared/SEOHead";
import { supabase } from "@/integrations/supabase/client";
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
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // ✅ فحص سريع للجلسة - بدون AuthContext
  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session) {
            // مستخدم مسجل - توجيه للتطبيق
            navigate('/redirect', { replace: true });
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false);
        }
      }
    };
    
    checkSession();
    
    return () => { mounted = false; };
  }, [navigate]);

  // ✅ عرض spinner أثناء التحقق
  if (isAuthenticated === null) {
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
