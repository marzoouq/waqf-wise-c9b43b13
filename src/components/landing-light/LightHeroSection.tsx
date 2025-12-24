/**
 * مكون Hero Section للصفحة الخفيفة
 */
import { Link } from "react-router-dom";
import { Shield, Users, Building2, ArrowLeft, Play } from "lucide-react";
import { LightButton } from "./LightButton";

export function LightHeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20" aria-labelledby="hero-title">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 sm:mb-8" role="status">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            نظام متكامل لإدارة الأوقاف الإسلامية
          </div>

          {/* Main Heading - LCP Element */}
          <h1 id="hero-title" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 sm:mb-6">
            منصة إدارة{" "}
            <span className="text-primary">الوقف الإلكترونية</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 sm:mb-10 leading-relaxed">
            نظام شامل ومتكامل لإدارة الأوقاف الإسلامية بكفاءة عالية وشفافية تامة،
            يدعم توزيع الغلة وإدارة المستفيدين والمحاسبة المتقدمة
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto" role="group" aria-label="إجراءات سريعة">
            <Link to="/login" className="w-full sm:w-auto">
              <LightButton variant="primary" className="w-full sm:w-auto">
                تسجيل الدخول
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </LightButton>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <LightButton variant="outline" className="w-full sm:w-auto">
                <Play className="w-4 h-4" aria-hidden="true" />
                اكتشف المزيد
              </LightButton>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-border/50" role="list" aria-label="مؤشرات الثقة">
            <div className="flex items-center gap-2 text-foreground/80" role="listitem">
              <Shield className="w-5 h-5 text-primary" aria-hidden="true" />
              <span className="text-sm font-semibold">آمن ومشفر</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80" role="listitem">
              <Users className="w-5 h-5 text-primary" aria-hidden="true" />
              <span className="text-sm font-semibold">+1000 مستفيد</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80" role="listitem">
              <Building2 className="w-5 h-5 text-primary" aria-hidden="true" />
              <span className="text-sm font-semibold">+50 عقار مُدار</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
