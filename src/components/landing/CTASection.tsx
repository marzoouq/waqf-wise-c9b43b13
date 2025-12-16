import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 md:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />

      <div className="container relative mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center px-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-xs sm:text-sm font-medium mb-4 sm:mb-6 md:mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ابدأ رحلتك اليوم
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary-foreground mb-3 sm:mb-4 md:mb-6">
            جاهز لإدارة وقفك بكفاءة؟
          </h2>

          {/* Description */}
          <p className="text-primary-foreground/80 text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            انضم إلى مئات الأوقاف التي تستخدم منصتنا لتحقيق أهدافها وخدمة
            مستفيديها بشكل أفضل
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in px-4 sm:px-0">
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                size="default"
                className="w-full sm:w-auto gap-2 bg-background text-primary hover:bg-background/90 shadow-xl shadow-foreground/10 text-sm sm:text-base h-10 sm:h-11"
              >
                تسجيل الدخول
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Trust Text */}
          <p className="text-primary-foreground/60 text-xs sm:text-sm mt-4 sm:mt-6 md:mt-8 animate-fade-in">
            الحسابات تُنشأ من قبل الناظر أو المشرف • دعم فني مجاني
          </p>
        </div>
      </div>
    </section>
  );
}
