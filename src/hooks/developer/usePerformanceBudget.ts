import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PerformanceBudget {
  lcp: number; // Largest Contentful Paint (ms)
  fcp: number; // First Contentful Paint (ms)
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte (ms)
  inp: number; // Interaction to Next Paint (ms)
}

const DEFAULT_BUDGET: PerformanceBudget = {
  lcp: 2500,
  fcp: 1800,
  cls: 0.1,
  ttfb: 800,
  inp: 200,
};

export function usePerformanceBudget(customBudget?: Partial<PerformanceBudget>) {
  const [budget] = useState<PerformanceBudget>({
    ...DEFAULT_BUDGET,
    ...customBudget,
  });

  const [violations, setViolations] = useState<string[]>([]);

  useEffect(() => {
    // مراقبة Web Vitals
    if ('web-vitals' in window) {
      import('web-vitals').then(({ onLCP, onFCP, onCLS, onTTFB, onINP }) => {
        onLCP((metric) => {
          if (metric.value > budget.lcp) {
            const violation = `LCP تجاوز الحد: ${metric.value.toFixed(0)}ms (الحد: ${budget.lcp}ms)`;
            setViolations(prev => [...prev, violation]);
            toast.warning("⚠️ تحذير أداء", {
              description: violation,
              duration: 5000,
            });
          }
        });

        onFCP((metric) => {
          if (metric.value > budget.fcp) {
            const violation = `FCP تجاوز الحد: ${metric.value.toFixed(0)}ms (الحد: ${budget.fcp}ms)`;
            setViolations(prev => [...prev, violation]);
            toast.warning("⚠️ تحذير أداء", {
              description: violation,
              duration: 5000,
            });
          }
        });

        onCLS((metric) => {
          if (metric.value > budget.cls) {
            const violation = `CLS تجاوز الحد: ${metric.value.toFixed(3)} (الحد: ${budget.cls})`;
            setViolations(prev => [...prev, violation]);
            toast.warning("⚠️ تحذير أداء", {
              description: violation,
              duration: 5000,
            });
          }
        });

        onTTFB((metric) => {
          if (metric.value > budget.ttfb) {
            const violation = `TTFB تجاوز الحد: ${metric.value.toFixed(0)}ms (الحد: ${budget.ttfb}ms)`;
            setViolations(prev => [...prev, violation]);
            toast.warning("⚠️ تحذير أداء", {
              description: violation,
              duration: 5000,
            });
          }
        });

        onINP((metric) => {
          if (metric.value > budget.inp) {
            const violation = `INP تجاوز الحد: ${metric.value.toFixed(0)}ms (الحد: ${budget.inp}ms)`;
            setViolations(prev => [...prev, violation]);
            toast.warning("⚠️ تحذير أداء", {
              description: violation,
              duration: 5000,
            });
          }
        });
      });
    }
  }, [budget]);

  return { budget, violations };
}
