import {
  Users,
  Building2,
  Calculator,
  PieChart,
  FolderArchive,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "إدارة المستفيدين",
    description:
      "نظام شامل لإدارة بيانات المستفيدين والعائلات مع متابعة كاملة للتوزيعات والطلبات",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Building2,
    title: "إدارة العقارات",
    description:
      "تتبع العقارات والأصول الوقفية، إدارة العقود والإيجارات مع تقارير العوائد",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Calculator,
    title: "المحاسبة المتكاملة",
    description:
      "نظام محاسبي متكامل يشمل شجرة الحسابات والقيود اليومية والتقارير المالية",
    color: "from-violet-500 to-violet-600",
  },
  {
    icon: PieChart,
    title: "توزيع الغلة",
    description:
      "توزيع عوائد الوقف وفق شروط الواقف مع محاكاة ومسار موافقات متعدد المستويات",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: FolderArchive,
    title: "الأرشفة الإلكترونية",
    description:
      "أرشفة ذكية للمستندات مع البحث المتقدم والتصنيف التلقائي وسياسات الاحتفاظ",
    color: "from-rose-500 to-rose-600",
  },
  {
    icon: BarChart3,
    title: "التقارير الذكية",
    description:
      "لوحات تحكم تفاعلية وتقارير مخصصة مع تحليلات ذكية ومؤشرات أداء",
    color: "from-cyan-500 to-cyan-600",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            المميزات
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            كل ما تحتاجه لإدارة الوقف
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            مجموعة متكاملة من الأدوات والمميزات لإدارة الأوقاف بكفاءة عالية
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
