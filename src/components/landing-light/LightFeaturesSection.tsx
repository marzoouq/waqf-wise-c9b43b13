/**
 * مكون Features Section للصفحة الخفيفة
 */
import { Users, Building2, BarChart3, Wallet } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

export function LightFeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            مميزات النظام
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            نظام متكامل يوفر جميع الأدوات اللازمة لإدارة الوقف بكفاءة عالية
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={Users}
            title="إدارة المستفيدين"
            description="نظام شامل لإدارة بيانات المستفيدين وتتبع مستحقاتهم"
          />
          <FeatureCard 
            icon={Building2}
            title="إدارة العقارات"
            description="متابعة العقارات الوقفية والإيجارات والصيانة"
          />
          <FeatureCard 
            icon={BarChart3}
            title="التقارير المالية"
            description="تقارير مفصلة ودقيقة عن الإيرادات والمصروفات"
          />
          <FeatureCard 
            icon={Wallet}
            title="توزيع الغلة"
            description="نظام آلي لحساب وتوزيع الغلة على المستفيدين"
          />
        </div>
      </div>
    </section>
  );
}
