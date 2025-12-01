import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, PiggyBank, TrendingDown, Inbox } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { useWaqfBudgets } from "@/hooks/useWaqfBudgets";
import { Skeleton } from "@/components/ui/skeleton";

export function BudgetsTab() {
  const { settings } = useVisibilitySettings();
  const { budgetCategories, annualBudget, reserveTotals, isLoading, hasBudgets, hasReserves } = useWaqfBudgets();

  if (!settings?.show_budgets) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          غير مصرح بعرض معلومات الميزانيات
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {settings?.show_annual_budget && (
        hasBudgets ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                الميزانية السنوية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">إجمالي الميزانية</p>
                  <p className="text-2xl font-bold">
                    <MaskedValue
                      value={annualBudget.total.toLocaleString("ar-SA")}
                      type="amount"
                      masked={settings?.mask_exact_amounts || false}
                    /> ريال
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">المُنفق</p>
                  <p className="text-2xl font-bold text-destructive">
                    <MaskedValue
                      value={annualBudget.spent.toLocaleString("ar-SA")}
                      type="amount"
                      masked={settings?.mask_exact_amounts || false}
                    /> ريال
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">المتبقي</p>
                  <p className="text-2xl font-bold text-success">
                    <MaskedValue
                      value={annualBudget.remaining.toLocaleString("ar-SA")}
                      type="amount"
                      masked={settings?.mask_exact_amounts || false}
                    /> ريال
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">نسبة التنفيذ</span>
                  <span className="text-sm font-medium">{annualBudget.percentage}%</span>
                </div>
                <Progress value={annualBudget.percentage} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد ميزانيات مُسجلة حالياً</p>
            </CardContent>
          </Card>
        )
      )}

      {settings?.show_budget_execution && (
        budgetCategories.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                تنفيذ الميزانية حسب الفئات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgetCategories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      <MaskedValue
                        value={category.spent.toLocaleString("ar-SA")}
                        type="amount"
                        masked={settings?.mask_exact_amounts || false}
                      /> / {" "}
                      <MaskedValue
                        value={category.budget.toLocaleString("ar-SA")}
                        type="amount"
                        masked={settings?.mask_exact_amounts || false}
                      /> ريال
                    </span>
                  </div>
                  <Progress value={category.percentage} />
                  <p className="text-xs text-muted-foreground text-left">{category.percentage}%</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد فئات ميزانية مُسجلة</p>
            </CardContent>
          </Card>
        )
      )}

      {settings?.show_reserve_funds && (
        hasReserves ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                صناديق الاحتياطي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">إجمالي الاحتياطي</p>
                  <p className="text-xl font-bold">
                    <MaskedValue
                      value={reserveTotals.total.toLocaleString("ar-SA")}
                      type="amount"
                      masked={settings?.mask_exact_amounts || false}
                    /> ريال
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">مستثمر</p>
                  <p className="text-xl font-bold text-primary">
                    <MaskedValue
                      value={reserveTotals.invested.toLocaleString("ar-SA")}
                      type="amount"
                      masked={settings?.mask_exact_amounts || false}
                    /> ريال
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">سائل</p>
                  <p className="text-xl font-bold text-success">
                    <MaskedValue
                      value={reserveTotals.liquid.toLocaleString("ar-SA")}
                      type="amount"
                      masked={settings?.mask_exact_amounts || false}
                    /> ريال
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد صناديق احتياطي</p>
            </CardContent>
          </Card>
        )
      )}

      {settings?.show_investment_plans && (
        <Card>
          <CardContent className="p-12 text-center">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد خطط استثمار</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
