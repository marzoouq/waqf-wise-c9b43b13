import { useEffect, useState, useRef } from "react";
import { Users, Building2, Banknote, CalendarDays } from "lucide-react";

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  color: string;
  delay: number;
}

function AnimatedCounter({ value, delay }: { value: number; delay: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          setTimeout(() => {
            let start = 0;
            const duration = 1500;
            const startTime = performance.now();
            
            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeOut = 1 - Math.pow(1 - progress, 3);
              const current = Math.round(easeOut * value);
              setDisplayValue(current);
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            
            requestAnimationFrame(animate);
          }, delay);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, delay, hasAnimated]);

  return <span ref={ref}>{displayValue.toLocaleString("ar-SA")}</span>;
}

function StatItem({ icon: Icon, value, suffix, label, color, delay }: StatItemProps) {
  return (
    <div className="relative group animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex flex-col items-center text-center p-6 sm:p-8">
        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${color} mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>

        {/* Value */}
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
          <AnimatedCounter value={value} delay={delay} />
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

export function StatsSection() {
  return (
    <section id="stats" className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background - Optimized */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
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
            <StatItem key={index} {...stat} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
