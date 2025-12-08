import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useBudgetManagement } from "@/hooks/accounting/useBudgetManagement";

export function BudgetManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState("annual");
  const { budgets, isLoading, calculatePercentage } = useBudgetManagement(selectedPeriod);

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الموازنات التقديرية</h2>
        <Button>
          <Plus className="ml-2 h-4 w-4" />
          موازنة جديدة
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        {["annual", "quarterly", "monthly"].map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            onClick={() => setSelectedPeriod(period)}
          >
            {period === "annual" ? "سنوي" : period === "quarterly" ? "ربع سنوي" : "شهري"}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {budgets?.map((budget) => {
          const percentage = calculatePercentage(
            budget.actual_amount,
            budget.budgeted_amount
          );
          const isOverBudget = percentage > 100;
          
          return (
            <Card key={budget.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {budget.accounts.code} - {budget.accounts.name_ar}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverBudget ? (
                      <TrendingUp className="h-4 w-4 text-destructive" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-success" />
                    )}
                    <span className={isOverBudget ? "text-destructive" : "text-success"}>
                      {percentage}%
                    </span>
                  </div>
                </div>

                <Progress value={Math.min(percentage, 100)} className="h-2" />

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">المخطط</p>
                    <p className="font-semibold">{formatCurrency(budget.budgeted_amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الفعلي</p>
                    <p className="font-semibold">{formatCurrency(budget.actual_amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الفرق</p>
                    <p className={`font-semibold ${
                      budget.variance_amount < 0 ? "text-destructive" : "text-success"
                    }`}>
                      {formatCurrency(Math.abs(budget.variance_amount))}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
