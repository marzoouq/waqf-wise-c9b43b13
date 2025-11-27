import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, PiggyBank, TrendingDown } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";

export function BudgetsTab() {
  const { settings } = useVisibilitySettings();

  if (!settings?.show_budgets) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          غير مصرح بعرض معلومات الميزانيات
        </CardContent>
      </Card>
    );
  }

  const budgetData = {
    annual: {
      total: 5000000,
      spent: 3200000,
      remaining: 1800000,
      percentage: 64,
    },
    categories: [
      { name: "التوزيعات", budget: 2500000, spent: 1800000, percentage: 72 },
      { name: "الصيانة", budget: 1200000, spent: 850000, percentage: 71 },
      { name: "الإدارة", budget: 800000, spent: 450000, percentage: 56 },
      { name: "التطوير", budget: 500000, spent: 100000, percentage: 20 },
    ],
    reserve: {
      total: 8500000,
      invested: 6000000,
      liquid: 2500000,
    },
    investments: [
      { name: "صكوك حكومية", amount: 3500000, return: 4.5 },
      { name: "عقارات استثمارية", amount: 2500000, return: 6.2 },
    ],
  };

  return (
    <div className="space-y-6">
      {settings?.show_annual_budget && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              الميزانية السنوية 2024
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي الميزانية</p>
                <p className="text-2xl font-bold">
                  <MaskedValue
                    value={budgetData.annual.total.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_exact_amounts || false}
                  /> ريال
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">المُنفق</p>
                <p className="text-2xl font-bold text-destructive">
                  <MaskedValue
                    value={budgetData.annual.spent.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_exact_amounts || false}
                  /> ريال
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">المتبقي</p>
                <p className="text-2xl font-bold text-success">
                  <MaskedValue
                    value={budgetData.annual.remaining.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_exact_amounts || false}
                  /> ريال
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">نسبة التنفيذ</span>
                <span className="text-sm font-medium">{budgetData.annual.percentage}%</span>
              </div>
              <Progress value={budgetData.annual.percentage} />
            </div>
          </CardContent>
        </Card>
      )}

      {settings?.show_budget_execution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              تنفيذ الميزانية حسب الفئات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetData.categories.map((category) => (
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
      )}

      {settings?.show_reserve_funds && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              صناديق الاحتياطي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">إجمالي الاحتياطي</p>
                <p className="text-xl font-bold">
                  <MaskedValue
                    value={budgetData.reserve.total.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_exact_amounts || false}
                  /> ريال
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">مستثمر</p>
                <p className="text-xl font-bold text-primary">
                  <MaskedValue
                    value={budgetData.reserve.invested.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_exact_amounts || false}
                  /> ريال
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">سائل</p>
                <p className="text-xl font-bold text-success">
                  <MaskedValue
                    value={budgetData.reserve.liquid.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_exact_amounts || false}
                  /> ريال
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {settings?.show_investment_plans && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              خطط الاستثمار
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetData.investments.map((investment, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{investment.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    <MaskedValue
                      value={investment.amount.toLocaleString("ar-SA")}
                      type="amount"
                      masked={settings?.mask_exact_amounts || false}
                    /> ريال
                  </p>
                </div>
                <Badge className="bg-success">عائد {investment.return}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
