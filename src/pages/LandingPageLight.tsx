/**
 * صفحة ترحيبية خفيفة
 * ✅ تستخدم useAuth مباشرة لأن AuthProvider متاح في App.tsx
 */

import { useEffect, useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";

// ✅ مكون زر خفيف بدون Radix UI - مع دعم إمكانية الوصول
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
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 px-6 py-3 text-base min-h-[48px] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
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

// ✅ مكون إحصائية
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
        <div
          className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${color} mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
        >
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
        </div>
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
          <span>{value.toLocaleString("ar-SA")}</span>
          <span className="text-primary">{suffix}</span>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">{label}</p>
      </div>
    </div>
  );
}

const stats = [
  { icon: Users, value: 1000, suffix: "+", label: "مستفيد مسجل", color: "bg-gradient-to-br from-blue-500 to-blue-600" },
  { icon: Building2, value: 50, suffix: "+", label: "عقار مُدار", color: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
  { icon: Banknote, value: 5, suffix: "M+", label: "ريال موزعة", color: "bg-gradient-to-br from-amber-500 to-amber-600" },
  { icon: CalendarDays, value: 10, suffix: "+", label: "سنوات خبرة", color: "bg-gradient-to-br from-violet-500 to-violet-600" },
];

export default function LandingPageLight() {
  // ✅ استخدام useAuth مباشرة - AuthProvider متاح في App.tsx
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
      }, 50); // تأخير قصير لأن البيانات جاهزة
      
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
      {/* Skip to main content - للتنقل السريع بلوحة المفاتيح */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        تخطي إلى المحتوى الرئيسي
      </a>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50" role="banner">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="التنقل الرئيسي">
          <div className="flex items-center justify-between h-16">
            <Link 
              to="/" 
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
              aria-label="منصة الوقف - الصفحة الرئيسية"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center" aria-hidden="true">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">وقف</span>
            </Link>
            <Link 
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              تسجيل الدخول
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content" role="main">
        {/* Hero Section */}
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
                <div className="flex items-center gap-2 text-muted-foreground" role="listitem">
                  <Shield className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span className="text-sm font-medium">آمن ومشفر</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground" role="listitem">
                  <Users className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span className="text-sm font-medium">+1000 مستفيد</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground" role="listitem">
                  <Building2 className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span className="text-sm font-medium">+50 عقار مُدار</span>
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
      <footer className="py-8 border-t border-border bg-background" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" aria-hidden="true" />
              <span className="font-semibold text-foreground">منصة الوقف</span>
            </div>
            <nav className="flex items-center gap-4 text-sm" aria-label="روابط التذييل">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded">سياسة الخصوصية</Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded">الشروط والأحكام</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded">اتصل بنا</Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} منصة الوقف. جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
