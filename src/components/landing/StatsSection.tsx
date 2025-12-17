import { Users, Building2, Banknote, CalendarDays } from "lucide-react";

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

function StatItem({ icon: Icon, value, suffix, label, color }: StatItemProps) {
  return (
    <div className="relative group">
      <div className="flex flex-col items-center text-center p-3 xs:p-4 sm:p-6 md:p-8">
        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl ${color} mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-foreground" />
        </div>

        {/* Value - بدون animation للـ LCP */}
        <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-1 sm:mb-2">
          <span>{value.toLocaleString("ar-SA")}</span>
          <span className="text-primary">{suffix}</span>
        </div>

        {/* Label */}
        <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">{label}</p>
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

export function StatsSection() {
  return (
    <section id="stats" className="py-12 sm:py-16 md:py-24 relative overflow-hidden">
      {/* Background - Optimized */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      <div className="container relative mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 px-2">
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4 animate-fade-in">
            إحصائيات
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            أرقام تتحدث عن نجاحنا
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            نفخر بثقة عملائنا وبالنتائج التي حققناها معهم
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-6 md:gap-8">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
