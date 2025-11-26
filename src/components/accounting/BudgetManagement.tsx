import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BudgetData {
  id: string;
  account_id: string;
  fiscal_year_id: string;
  period_type: string;
  budgeted_amount: number;
  actual_amount: number;
  variance_amount: number;
  accounts: {
    code: string;
    name_ar: string;
  };
}

export function BudgetManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState("annual");

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets", selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select(`
          *,
          accounts (
            code,
            name_ar
          )
        `)
        .eq("period_type", selectedPeriod)
        .order("accounts(code)", { ascending: true });
      
      if (error) throw error;
      return data as BudgetData[];
    },
  });

  const calculatePercentage = (actual: number, budgeted: number) => {
    if (budgeted === 0) return 0;
    return Math.round((actual / budgeted) * 100);
  };

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
