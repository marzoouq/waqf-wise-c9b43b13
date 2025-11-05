import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const BudgetReports = () => {
  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select(`
          *,
          account:accounts(code, name_ar),
          fiscal_year:fiscal_years(name)
        `)
        .order("period_type");
      if (error) throw error;
      return data;
    },
  });

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "text-green-600";
    if (variance < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getPercentage = (actual: number, budgeted: number) => {
    if (budgeted === 0) return 0;
    return (actual / budgeted) * 100;
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">تقارير الميزانيات</h2>
      </div>

      {budgets && budgets.length > 0 ? (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">السنة المالية</TableHead>
                <TableHead>الحساب</TableHead>
                <TableHead className="hidden sm:table-cell">الفترة</TableHead>
                <TableHead className="text-center">المخطط</TableHead>
                <TableHead className="text-center">الفعلي</TableHead>
                <TableHead className="text-center hidden lg:table-cell">الانحراف</TableHead>
                <TableHead className="text-center">النسبة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget: any) => {
                const variance = Number(budget.actual_amount) - Number(budget.budgeted_amount);
                const percentage = getPercentage(
                  Number(budget.actual_amount),
                  Number(budget.budgeted_amount)
                );

                return (
                  <TableRow key={budget.id}>
                    <TableCell className="hidden md:table-cell">{budget.fiscal_year.name}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs sm:text-sm">{budget.account.code}</div>
                      <div className="text-xs sm:text-sm">{budget.account.name_ar}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {budget.period_type === "monthly" && `شهر ${budget.period_number}`}
                        {budget.period_type === "quarterly" && `ربع ${budget.period_number}`}
                        {budget.period_type === "yearly" && "سنوي"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs sm:text-sm">
                      {Number(budget.budgeted_amount).toLocaleString("ar-SA", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs sm:text-sm">
                      {Number(budget.actual_amount).toLocaleString("ar-SA", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                    <TableCell className={`text-center font-mono text-xs sm:text-sm hidden lg:table-cell ${getVarianceColor(variance)}`}>
                      {variance.toLocaleString("ar-SA", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                        signDisplay: "always",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs sm:text-sm font-mono">
                          {percentage.toFixed(0)}%
                        </span>
                        <Progress value={Math.min(percentage, 100)} className="w-12 sm:w-20" />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          لا توجد بيانات ميزانيات متاحة
        </Card>
      )}
    </div>
  );
};

export default BudgetReports;
