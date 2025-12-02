import { useFinancialReports } from "@/hooks/useFinancialReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, TrendingUp, TrendingDown } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { Progress } from "@/components/ui/progress";

export function EnhancedIncomeStatement() {
  const { incomeStatement, isLoading } = useFinancialReports();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  if (isLoading || !incomeStatement) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  const profitMargin = incomeStatement.revenue.total > 0
    ? (incomeStatement.netIncome / incomeStatement.revenue.total) * 100
    : 0;

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl sm:text-2xl md:text-2xl">قائمة الدخل</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              للفترة المنتهية في: {format(new Date(), "dd MMMM yyyy", { locale: ar })}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Printer className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              طباعة
            </Button>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Download className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              تصدير PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
        {/* Revenue Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-r-4 border-success pr-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            الإيرادات
          </h3>
          
          <div className="space-y-3 pr-6">
            <div className="flex justify-between items-center">
              <span>إيرادات عقارية</span>
              <span className="font-mono">{formatNumber(incomeStatement.revenue.property)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>إيرادات استثمارات</span>
              <span className="font-mono">{formatNumber(incomeStatement.revenue.investment)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>إيرادات أخرى</span>
              <span className="font-mono">{formatNumber(incomeStatement.revenue.other)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t-2 font-semibold">
              <span>إجمالي الإيرادات</span>
              <span className="font-mono text-success text-lg">
                {formatNumber(incomeStatement.revenue.total)}
              </span>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="space-y-2 pr-6">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>إيرادات عقارية</span>
                <span>{((incomeStatement.revenue.property / incomeStatement.revenue.total) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(incomeStatement.revenue.property / incomeStatement.revenue.total) * 100} className="h-2" />
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-r-4 border-destructive pr-3 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            المصروفات
          </h3>
          
          <div className="space-y-3 pr-6">
            <div className="flex justify-between items-center">
              <span>مصروفات إدارية</span>
              <span className="font-mono">{formatNumber(incomeStatement.expenses.administrative)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>مصروفات تشغيلية</span>
              <span className="font-mono">{formatNumber(incomeStatement.expenses.operational)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>مصروفات المستفيدين</span>
              <span className="font-mono">{formatNumber(incomeStatement.expenses.beneficiaries)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t-2 font-semibold">
              <span>إجمالي المصروفات</span>
              <span className="font-mono text-destructive text-lg">
                {formatNumber(incomeStatement.expenses.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Net Income Section */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">صافي الدخل</h3>
              <p className="text-sm text-muted-foreground">هامش الربح: {profitMargin.toFixed(2)}%</p>
            </div>
            <div className="text-left">
              <span className={`font-mono font-bold text-2xl ${
                incomeStatement.netIncome >= 0 ? "text-success" : "text-destructive"
              }`}>
                {incomeStatement.netIncome >= 0 ? "+" : "-"}
                {formatNumber(Math.abs(incomeStatement.netIncome))}
              </span>
              <p className="text-xs text-muted-foreground mt-1">ريال سعودي</p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">نسبة المصروفات</p>
            <p className="text-2xl font-bold">
              {((incomeStatement.expenses.total / incomeStatement.revenue.total) * 100).toFixed(1)}%
            </p>
          </Card>
          
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">العائد على الإيرادات</p>
            <p className="text-2xl font-bold text-success">
              {profitMargin.toFixed(1)}%
            </p>
          </Card>
          
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">كفاءة التشغيل</p>
            <p className="text-2xl font-bold">
              {((incomeStatement.revenue.total - incomeStatement.expenses.operational) / incomeStatement.revenue.total * 100).toFixed(1)}%
            </p>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}