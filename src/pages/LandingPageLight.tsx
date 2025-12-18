/**
 * صفحة ترحيبية خفيفة - بدون تبعيات ثقيلة
 * Lightweight Landing Page - No heavy dependencies
 * هذه الصفحة تتجنب استيراد أي مكونات من Radix UI أو مكتبات ثقيلة أخرى
 * 
 * ✅ توجيه تلقائي للمستخدمين المسجلين إلى لوحة التحكم الخاصة بهم
 * ✅ لا تستخدم AuthContext - تستخدم useLightAuth الخفيف
 */

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Shield, 
  Users, 
  Building2, 
  ArrowLeft, 
  Play, 
  BarChart3, 
  Wallet,
  ChevronLeft,
  Banknote,
  CalendarDays
} from "lucide-react";
import { useLightAuth } from "@/hooks/auth/useLightAuth";

// ✅ مكون زر خفيف بدون Radix UI
function LightButton({ 
  children, 
  variant = "primary", 
  className = "",
  ...props 
}: { 
  children: React.ReactNode; 
  variant?: "primary" | "outline";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 px-6 py-3 text-base min-h-[48px] select-none";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
    outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground"
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ✅ مكون بطاقة ميزة خفيف
function FeatureCard({ icon: Icon, title, description }: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-border/50 bg-card hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// ✅ مكون إحصائية غني مع أيقونات ملونة
function StatItem({ 
  icon: Icon, 
  value, 
  suffix, 
  label, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  color: string;
}) {
  return (
    <div className="relative group">
      <div className="flex flex-col items-center text-center p-6 sm:p-8">
        {/* Icon with gradient background */}
        <div
          className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${color} mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
        >
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
        </div>

        {/* Value */}
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
          <span>{value.toLocaleString("ar-SA")}</span>
          <span className="text-primary">{suffix}</span>
        </div>

        {/* Label */}
        <p className="text-muted-foreground text-sm sm:text-base">{label}</p>
      </div>
    </div>
  );
}

const stats = [
  {
    icon: Users,
    value: 1000,
    suffix: "+",
    label: "مستفيد مسجل",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
  },
  {
    icon: Building2,
    value: 50,
    suffix: "+",
    label: "عقار مُدار",
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
  },
  {
    icon: Banknote,
    value: 5,
    suffix: "M+",
    label: "ريال موزعة",
    color: "bg-gradient-to-br from-amber-500 to-amber-600",
  },
  {
    icon: CalendarDays,
    value: 10,
    suffix: "+",
    label: "سنوات خبرة",
    color: "bg-gradient-to-br from-violet-500 to-violet-600",
  },
];

export default function LandingPageLight() {
  // ✅ استخدام useLightAuth بدلاً من useAuth الثقيل
  const { isLoggedIn, isLoading, redirectPath } = useLightAuth();
  const navigate = useNavigate();

  // ✅ توجيه تلقائي للمستخدمين المسجلين إلى لوحة التحكم
  useEffect(() => {
    if (isLoading) return;
    
    if (isLoggedIn && redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  }, [isLoggedIn, isLoading, redirectPath, navigate]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">وقف</span>
            </div>
            <Link 
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              تسجيل الدخول
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 sm:mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                نظام متكامل لإدارة الأوقاف الإسلامية
              </div>

              {/* Main Heading - LCP Element */}
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
                <Link to="/login" className="w-full sm:w-auto">
                  <LightButton variant="primary" className="w-full sm:w-auto">
                    تسجيل الدخول
                    <ArrowLeft className="w-4 h-4" />
                  </LightButton>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <LightButton variant="outline" className="w-full sm:w-auto">
                    <Play className="w-4 h-4" />
                    اكتشف المزيد
                  </LightButton>
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
        </section>

        {/* Features Section */}
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

        {/* Stats Section - Rich Design */}
        <section id="stats" className="py-16 sm:py-24 relative overflow-hidden">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                إحصائيات
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                أرقام تتحدث عن نجاحنا
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                نفخر بثقة عملائنا وبالنتائج التي حققناها معهم
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {stats.map((stat, index) => (
                <StatItem key={index} {...stat} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                كيف يعمل النظام؟
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                خطوات بسيطة للبدء في استخدام نظام إدارة الوقف
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: "1", title: "التسجيل", desc: "أنشئ حسابك في دقائق" },
                { step: "2", title: "إعداد البيانات", desc: "أضف بيانات الوقف والمستفيدين" },
                { step: "3", title: "البدء بالعمل", desc: "ابدأ في إدارة الوقف بكفاءة" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
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
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">منصة الوقف</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">سياسة الخصوصية</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">الشروط والأحكام</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">اتصل بنا</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} منصة الوقف. جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
