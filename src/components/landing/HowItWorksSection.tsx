import { UserPlus, Settings, PieChart, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "إنشاء حساب",
    description: "سجل حساباً جديداً وأدخل بيانات الوقف الأساسية",
    step: "01",
  },
  {
    icon: Settings,
    title: "إعداد النظام",
    description: "أضف المستفيدين والعقارات وقواعد التوزيع",
    step: "02",
  },
  {
    icon: PieChart,
    title: "إدارة الغلة",
    description: "سجل الإيرادات وقم بتوزيعها على المستفيدين",
    step: "03",
  },
  {
    icon: CheckCircle,
    title: "متابعة النتائج",
    description: "راقب التقارير وتتبع أداء الوقف بشفافية",
    step: "04",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-24 bg-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 px-2">
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4 animate-fade-in">
            كيف يعمل
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            ابدأ في 4 خطوات بسيطة
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            نظام سهل الاستخدام يمكنك البدء به في دقائق
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-l from-primary/20 via-primary/40 to-primary/20" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step Number */}
                <div className="absolute -top-1.5 -right-1.5 xs:-top-2 xs:-right-2 sm:-top-3 sm:-right-3 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs sm:text-sm md:text-base font-bold shadow-lg z-10">
                  {step.step}
                </div>

                {/* Card */}
                <div className="relative bg-card border border-border/50 rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 md:p-8 text-center hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-primary/10 text-primary mb-3 sm:mb-4 md:mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <step.icon className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-foreground mb-1.5 sm:mb-2 md:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
