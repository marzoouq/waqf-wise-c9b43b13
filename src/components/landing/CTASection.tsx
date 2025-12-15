import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6 sm:mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            ابدأ رحلتك اليوم
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6">
            جاهز لإدارة وقفك بكفاءة؟
          </h2>

          {/* Description */}
          <p className="text-primary-foreground/80 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto">
            انضم إلى مئات الأوقاف التي تستخدم منصتنا لتحقيق أهدافها وخدمة
            مستفيديها بشكل أفضل
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in">
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 bg-background text-primary hover:bg-background/90 shadow-xl shadow-foreground/10"
              >
                تسجيل الدخول
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Trust Text */}
          <p className="text-primary-foreground/60 text-sm mt-6 sm:mt-8 animate-fade-in">
            الحسابات تُنشأ من قبل الناظر أو المشرف • دعم فني مجاني
          </p>
        </div>
      </div>
    </section>
  );
}
