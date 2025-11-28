import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, Building2, Banknote, CalendarDays } from "lucide-react";

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: "easeOut",
    });

    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded]);

  return <span>{displayValue.toLocaleString("ar-SA")}</span>;
}

function StatItem({ icon: Icon, value, suffix, label, color }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative group"
    >
      <div className="flex flex-col items-center text-center p-6 sm:p-8">
        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${color} mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>

        {/* Value */}
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
          <AnimatedCounter value={value} />
          <span className="text-primary">{suffix}</span>
        </div>

        {/* Label */}
        <p className="text-muted-foreground text-sm sm:text-base">{label}</p>
      </div>
    </motion.div>
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
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            إحصائيات
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            أرقام تتحدث عن نجاحنا
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-base sm:text-lg"
          >
            نفخر بثقة عملائنا وبالنتائج التي حققناها معهم
          </motion.p>
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
