/**
 * SmartInsights - مكون التنبيهات والرؤى الذكية
 * @description يعرض تحليلات وتنبيهات ذكية مبنية على بيانات الإفصاح
 * @version 2.8.66
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { AnnualDisclosure } from "@/hooks/reports/useAnnualDisclosures";

interface SmartInsightsProps {
  currentYear: AnnualDisclosure;
  previousYear?: AnnualDisclosure | null;
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info';
  icon: React.ReactNode;
  title: string;
  description: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ar-SA", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export function SmartInsights({ currentYear, previousYear }: SmartInsightsProps) {
  const insights: Insight[] = [];

  // تحليل الإيرادات
  if (previousYear) {
    const revenueChange = calculateChange(currentYear.total_revenues, previousYear.total_revenues);
    if (revenueChange > 15) {
      insights.push({
        id: 'revenue-growth',
        type: 'success',
        icon: <TrendingUp className="h-4 w-4" />,
        title: 'نمو في الإيرادات',
        description: `زادت الإيرادات بنسبة ${revenueChange.toFixed(0)}% مقارنة بالعام السابق (${formatCurrency(currentYear.total_revenues - previousYear.total_revenues)} ر.س)`,
      });
    } else if (revenueChange < -10) {
      insights.push({
        id: 'revenue-decline',
        type: 'warning',
        icon: <TrendingDown className="h-4 w-4" />,
        title: 'انخفاض في الإيرادات',
        description: `انخفضت الإيرادات بنسبة ${Math.abs(revenueChange).toFixed(0)}% مقارنة بالعام السابق`,
      });
    }

    // تحليل المصروفات
    const expenseChange = calculateChange(currentYear.total_expenses, previousYear.total_expenses);
    if (expenseChange > 25) {
      insights.push({
        id: 'expense-increase',
        type: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'ارتفاع في المصروفات',
        description: `ارتفعت المصروفات بنسبة ${expenseChange.toFixed(0)}% - يُنصح بمراجعة بنود الصرف`,
      });
    } else if (expenseChange < -10) {
      insights.push({
        id: 'expense-decrease',
        type: 'success',
        icon: <CheckCircle2 className="h-4 w-4" />,
        title: 'ترشيد في المصروفات',
        description: `تم تخفيض المصروفات بنسبة ${Math.abs(expenseChange).toFixed(0)}% - إدارة فعّالة`,
      });
    }

    // تحليل حصة الوريث
    const avgHeirShareCurrent = currentYear.corpus_share / currentYear.total_beneficiaries;
    const avgHeirSharePrevious = previousYear.corpus_share / previousYear.total_beneficiaries;
    const heirShareChange = calculateChange(avgHeirShareCurrent, avgHeirSharePrevious);
    if (heirShareChange > 10) {
      insights.push({
        id: 'heir-share-increase',
        type: 'success',
        icon: <TrendingUp className="h-4 w-4" />,
        title: 'زيادة في حصة الوريث',
        description: `ارتفع متوسط حصة الوريث الواحد بنسبة ${heirShareChange.toFixed(0)}%`,
      });
    }
  }

  // تحليل نسبة المصروفات للإيرادات
  const expenseRatio = (currentYear.total_expenses / currentYear.total_revenues) * 100;
  if (expenseRatio < 10) {
    insights.push({
      id: 'low-expense-ratio',
      type: 'success',
      icon: <CheckCircle2 className="h-4 w-4" />,
      title: 'كفاءة تشغيلية ممتازة',
      description: `نسبة المصروفات للإيرادات ${expenseRatio.toFixed(1)}% فقط`,
    });
  } else if (expenseRatio > 20) {
    insights.push({
      id: 'high-expense-ratio',
      type: 'warning',
      icon: <AlertTriangle className="h-4 w-4" />,
      title: 'نسبة مصروفات مرتفعة',
      description: `نسبة المصروفات للإيرادات ${expenseRatio.toFixed(1)}% - قد تحتاج مراجعة`,
    });
  }

  // معلومات عامة
  insights.push({
    id: 'corpus-accumulated',
    type: 'info',
    icon: <Info className="h-4 w-4" />,
    title: 'رقبة الوقف المتراكمة',
    description: `المتبقي المُرحّل للسنة القادمة: ${formatCurrency(currentYear.corpus_share)} ر.س`,
  });

  // إذا لم تكن هناك سنة سابقة
  if (!previousYear) {
    insights.unshift({
      id: 'first-year',
      type: 'info',
      icon: <Info className="h-4 w-4" />,
      title: 'السنة الأولى',
      description: 'هذا أول إفصاح سنوي - ستتوفر المقارنات في السنوات القادمة',
    });
  }

  const getInsightStyles = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-700';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-700';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2 p-3 sm:p-4">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
          رؤى ذكية
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          تحليلات وملاحظات مبنية على بيانات الإفصاح
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="space-y-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${getInsightStyles(insight.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {insight.icon}
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="font-medium text-xs sm:text-sm">{insight.title}</p>
                <p className="text-[10px] sm:text-xs opacity-80">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
