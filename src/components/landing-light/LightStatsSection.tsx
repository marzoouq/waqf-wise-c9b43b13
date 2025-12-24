/**
 * مكون Stats Section للصفحة الخفيفة
 */
import { Users, Building2, Banknote, CalendarDays } from "lucide-react";
import { StatItem } from "./StatItem";

const stats = [
  { icon: Users, value: 1000, suffix: "+", label: "مستفيد مسجل", color: "bg-gradient-to-br from-blue-500 to-blue-600" },
  { icon: Building2, value: 50, suffix: "+", label: "عقار مُدار", color: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
  { icon: Banknote, value: 5, suffix: "M+", label: "ريال موزعة", color: "bg-gradient-to-br from-amber-500 to-amber-600" },
  { icon: CalendarDays, value: 10, suffix: "+", label: "سنوات خبرة", color: "bg-gradient-to-br from-violet-500 to-violet-600" },
];

export function LightStatsSection() {
  return (
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
  );
}
