import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Budget } from "@/hooks/accounting/useBudgets";
import { formatCurrency } from "@/lib/utils";

interface BudgetAnalysisCardProps {
  budgets: Budget[];
}

export function BudgetAnalysisCard({ budgets }: BudgetAnalysisCardProps) {
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgeted_amount, 0);
  const totalActual = budgets.reduce((sum, b) => sum + (b.actual_amount || 0), 0);
  const totalVariance = budgets.reduce((sum, b) => sum + (b.variance_amount || 0), 0);
  const utilizationRate = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

  // حساب الميزانيات المتجاوزة
  const overBudget = budgets.filter(b => (b.actual_amount || 0) > b.budgeted_amount).length;
  const underBudget = budgets.filter(b => (b.actual_amount || 0) < b.budgeted_amount).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المقدّر</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            لجميع الميزانيات ({budgets.length})
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الفعلي</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalActual)}</div>
          <Progress value={utilizationRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            نسبة التنفيذ: {utilizationRate.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الانحراف الكلي</CardTitle>
          {totalVariance >= 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalVariance >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(Math.abs(totalVariance))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalVariance >= 0 ? "توفير" : "تجاوز"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">التنبيهات</CardTitle>
          <AlertCircle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overBudget}</div>
          <p className="text-xs text-muted-foreground mt-1">
            ميزانيات متجاوزة • {underBudget} ميزانيات أقل
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
