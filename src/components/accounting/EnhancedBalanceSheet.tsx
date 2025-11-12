import { useFinancialReports } from "@/hooks/useFinancialReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function EnhancedBalanceSheet() {
  const { balanceSheet, isLoading } = useFinancialReports();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  if (isLoading || !balanceSheet) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  const totalAssets = balanceSheet.assets.total;
  const totalLiabilitiesAndEquity = balanceSheet.liabilities.total + balanceSheet.equity.total;
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">قائمة المركز المالي</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              كما في: {format(new Date(), "dd MMMM yyyy", { locale: ar })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
            <Button variant="outline" size="sm">
              <Download className="ml-2 h-4 w-4" />
              تصدير PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Assets Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b-2 border-blue-500 pb-2">الأصول</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">أصول متداولة:</span>
                <span className="font-mono">{formatNumber(balanceSheet.assets.current)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-semibold">أصول ثابتة:</span>
                <span className="font-mono">{formatNumber(balanceSheet.assets.fixed)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t-2 border-blue-500">
                <span className="font-bold text-lg">إجمالي الأصول:</span>
                <span className="font-mono font-bold text-lg text-blue-600">
                  {formatNumber(balanceSheet.assets.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b-2 border-orange-500 pb-2">الخصوم وحقوق الملكية</h3>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-orange-600">الخصوم:</h4>
              
              <div className="flex justify-between items-center pr-4">
                <span>خصوم متداولة:</span>
                <span className="font-mono">{formatNumber(balanceSheet.liabilities.current)}</span>
              </div>
              
              <div className="flex justify-between items-center pr-4">
                <span>خصوم طويلة الأجل:</span>
                <span className="font-mono">{formatNumber(balanceSheet.liabilities.longTerm)}</span>
              </div>
              
              <div className="flex justify-between items-center font-semibold">
                <span>إجمالي الخصوم:</span>
                <span className="font-mono">{formatNumber(balanceSheet.liabilities.total)}</span>
              </div>

              <h4 className="font-semibold text-purple-600 pt-4">حقوق الملكية:</h4>
              
              <div className="flex justify-between items-center pr-4">
                <span>رأس مال الوقف:</span>
                <span className="font-mono">{formatNumber(balanceSheet.equity.capital)}</span>
              </div>
              
              <div className="flex justify-between items-center pr-4">
                <span>الاحتياطيات:</span>
                <span className="font-mono">{formatNumber(balanceSheet.equity.reserves)}</span>
              </div>
              
              <div className="flex justify-between items-center font-semibold">
                <span>إجمالي حقوق الملكية:</span>
                <span className="font-mono">{formatNumber(balanceSheet.equity.total)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t-2 border-orange-500">
                <span className="font-bold text-lg">إجمالي الخصوم وحقوق الملكية:</span>
                <span className="font-mono font-bold text-lg text-orange-600">
                  {formatNumber(totalLiabilitiesAndEquity)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Check */}
        <div className="mt-6 p-4 rounded-lg bg-muted">
          <div className="flex items-center justify-between">
            <span className="font-semibold">حالة التوازن:</span>
            {isBalanced ? (
              <Badge variant="default" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                متوازنة
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-2">
                <XCircle className="h-4 w-4" />
                غير متوازنة - فرق: {formatNumber(Math.abs(totalAssets - totalLiabilitiesAndEquity))}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}