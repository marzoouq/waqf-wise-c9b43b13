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
    <section id="how-it-works" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
            كيف يعمل
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            ابدأ في 4 خطوات بسيطة
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            نظام سهل الاستخدام يمكنك البدء به في دقائق
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-l from-primary/20 via-primary/40 to-primary/20" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step Number */}
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm sm:text-base font-bold shadow-lg z-10">
                  {step.step}
                </div>

                {/* Card */}
                <div className="relative bg-card border border-border/50 rounded-2xl p-6 sm:p-8 text-center hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 text-primary mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <step.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {step.description}
                  </p>
                </div>

                {/* Arrow - Mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4 sm:hidden">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-primary/40 to-primary/20" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
