/**
 * YearComparisonCard - مكون مقارنة السنوات
 * @description يعرض مقارنة بصرية بين السنة الحالية والسابقة مع نسب التغيير
 * @version 2.8.66
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { AnnualDisclosure } from "@/hooks/reports/useAnnualDisclosures";

interface YearComparisonCardProps {
  currentYear: AnnualDisclosure;
  previousYear?: AnnualDisclosure | null;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ar-SA", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const calculateChange = (current: number, previous: number): { value: number; isPositive: boolean | null } => {
  if (previous === 0) return { value: 0, isPositive: null };
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change),
    isPositive: change > 0 ? true : change < 0 ? false : null,
  };
};

interface ComparisonRowProps {
  label: string;
  currentValue: number;
  previousValue: number;
  isExpense?: boolean;
}

function ComparisonRow({ label, currentValue, previousValue, isExpense = false }: ComparisonRowProps) {
  const change = calculateChange(currentValue, previousValue);
  
  // للمصروفات: الزيادة سلبية، النقصان إيجابي
  const isGood = isExpense 
    ? change.isPositive === false 
    : change.isPositive === true;

  return (
    <div className="grid grid-cols-4 gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors text-xs sm:text-sm">
      <div className="font-medium">{label}</div>
      <div className="text-muted-foreground text-center">{formatCurrency(previousValue)}</div>
      <div className="font-semibold text-center">{formatCurrency(currentValue)}</div>
      <div className="flex items-center justify-end gap-1">
        {change.isPositive === null ? (
          <Minus className="h-3 w-3 text-muted-foreground" />
        ) : change.isPositive ? (
          <TrendingUp className={`h-3 w-3 ${isGood ? 'text-emerald-600' : 'text-red-600'}`} />
        ) : (
          <TrendingDown className={`h-3 w-3 ${isGood ? 'text-emerald-600' : 'text-red-600'}`} />
        )}
        <span className={`font-medium ${
          change.isPositive === null 
            ? 'text-muted-foreground' 
            : isGood 
              ? 'text-emerald-600' 
              : 'text-red-600'
        }`}>
          {change.value.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export function YearComparisonCard({ currentYear, previousYear }: YearComparisonCardProps) {
  if (!previousYear) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">لا توجد بيانات للسنة السابقة للمقارنة</p>
        </CardContent>
      </Card>
    );
  }

  const revenueChange = calculateChange(currentYear.total_revenues, previousYear.total_revenues);
  const expenseChange = calculateChange(currentYear.total_expenses, previousYear.total_expenses);
  const netChange = calculateChange(currentYear.net_income, previousYear.net_income);

  // حساب التنبيه الذكي
  const getInsight = () => {
    if (revenueChange.value > 20 && revenueChange.isPositive) {
      return { text: `نمو ملحوظ في الإيرادات بنسبة ${revenueChange.value.toFixed(0)}%`, type: 'success' };
    }
    if (expenseChange.value > 30 && expenseChange.isPositive) {
      return { text: `ارتفاع كبير في المصروفات بنسبة ${expenseChange.value.toFixed(0)}%`, type: 'warning' };
    }
    if (netChange.isPositive && netChange.value > 10) {
      return { text: `تحسن في صافي الدخل بنسبة ${netChange.value.toFixed(0)}%`, type: 'success' };
    }
    return null;
  };

  const insight = getInsight();

  return (
    <Card>
      <CardHeader className="pb-2 p-3 sm:p-4">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          المقارنة السنوية
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          مقارنة الأداء المالي بين {previousYear.year - 1}-{previousYear.year} و {currentYear.year - 1}-{currentYear.year}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
        {/* رأس الجدول */}
        <div className="grid grid-cols-4 gap-2 py-2 px-3 bg-muted rounded-lg text-xs sm:text-sm font-medium">
          <div>البند</div>
          <div className="text-center">{previousYear.year - 1}-{previousYear.year}</div>
          <div className="text-center">{currentYear.year - 1}-{currentYear.year}</div>
          <div className="text-left">التغيير</div>
        </div>

        {/* الصفوف */}
        <div className="space-y-1 divide-y divide-border/50">
          <ComparisonRow 
            label="الإيرادات" 
            currentValue={currentYear.total_revenues} 
            previousValue={previousYear.total_revenues} 
          />
          <ComparisonRow 
            label="المصروفات" 
            currentValue={currentYear.total_expenses} 
            previousValue={previousYear.total_expenses}
            isExpense={true}
          />
          <ComparisonRow 
            label="صافي الدخل" 
            currentValue={currentYear.net_income} 
            previousValue={previousYear.net_income} 
          />
          <ComparisonRow 
            label="التوزيعات" 
            currentValue={currentYear.corpus_share + (currentYear.nazer_share || 0)} 
            previousValue={previousYear.corpus_share + (previousYear.nazer_share || 0)} 
          />
        </div>

        {/* التنبيه الذكي */}
        {insight && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-xs sm:text-sm ${
            insight.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
          }`}>
            <span className="text-lg">{insight.type === 'success' ? '💡' : '⚠️'}</span>
            {insight.text}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
