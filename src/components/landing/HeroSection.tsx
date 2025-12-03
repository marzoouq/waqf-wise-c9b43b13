import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Shield, Users, Building2 } from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
      style={{ contain: "layout" }}
    >
      {/* Background - Simple for faster paint */}
      <div className="absolute inset-0 bg-background" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge - No animation for faster LCP */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 sm:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            نظام متكامل لإدارة الأوقاف الإسلامية
          </div>

          {/* Main Heading - LCP Element - No complex styles */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 sm:mb-6">
            منصة إدارة{" "}
            <span className="text-primary">الوقف الإلكترونية</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 sm:mb-10 leading-relaxed">
            نظام شامل ومتكامل لإدارة الأوقاف الإسلامية بكفاءة عالية وشفافية تامة،
            يدعم توزيع الغلة وإدارة المستفيدين والمحاسبة المتقدمة
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                ابدأ الآن مجاناً
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2 border-2"
              >
                <Play className="w-4 h-4" />
                شاهد كيف يعمل
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm">آمن ومشفر</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm">+1000 مستفيد</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="text-sm">+50 عقار مُدار</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified bottom border instead of SVG */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border/30" />
    </section>
  );
}
