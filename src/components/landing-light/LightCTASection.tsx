/**
 * مكون CTA Section للصفحة الخفيفة
 */
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { LightButton } from "./LightButton";

export function LightCTASection() {
  return (
    <section className="py-16 sm:py-20 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          ابدأ الآن مجاناً
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          انضم إلى مئات الأوقاف التي تستخدم نظامنا لإدارة أصولها بكفاءة
        </p>
        <Link to="/login">
          <LightButton variant="primary">
            ابدأ الآن
            <ChevronLeft className="w-4 h-4" />
          </LightButton>
        </Link>
      </div>
    </section>
  );
}
