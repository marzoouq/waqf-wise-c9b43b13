import { useFinancialReports } from "@/hooks/useFinancialReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, CheckCircle, XCircle, FileText } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { exportFinancialStatementToPDF } from "@/lib/exportHelpers";

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

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const sections = [
      {
        title: 'الأصول',
        items: [
          { label: 'أصول متداولة', amount: balanceSheet.assets.current },
          { label: 'أصول ثابتة', amount: balanceSheet.assets.fixed },
        ]
      },
      {
        title: 'الخصوم',
        items: [
          { label: 'خصوم متداولة', amount: balanceSheet.liabilities.current },
          { label: 'خصوم طويلة الأجل', amount: balanceSheet.liabilities.longTerm },
        ]
      },
      {
        title: 'حقوق الملكية',
        items: [
          { label: 'رأس مال الوقف', amount: balanceSheet.equity.capital },
          { label: 'الاحتياطيات', amount: balanceSheet.equity.reserves },
        ]
      }
    ];

    const totals = [
      { label: 'إجمالي الأصول', amount: totalAssets },
      { label: 'إجمالي الخصوم وحقوق الملكية', amount: totalLiabilitiesAndEquity },
    ];

    await exportFinancialStatementToPDF(
      `قائمة المركز المالي - ${format(new Date(), "dd/MM/yyyy")}`,
      sections,
      totals,
      `balance-sheet-${format(new Date(), "yyyyMMdd")}`
    );
  };

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl sm:text-2xl md:text-2xl">قائمة المركز المالي</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              كما في: {format(new Date(), "dd MMMM yyyy", { locale: ar })}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap print:hidden">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={handlePrint}>
              <Printer className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              طباعة
            </Button>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={handleExportPDF}>
              <FileText className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              تصدير PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Assets Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b-2 border-info pb-2">الأصول</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">أصول متداولة:</span>
                <span className="font-mono">{formatNumber(balanceSheet.assets.current)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-semibold">أصول ثابتة:</span>
                <span className="font-mono">{formatNumber(balanceSheet.assets.fixed)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t-2 border-info">
                <span className="font-bold text-lg">إجمالي الأصول:</span>
                <span className="font-mono font-bold text-lg text-info">
                  {formatNumber(balanceSheet.assets.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b-2 border-warning pb-2">الخصوم وحقوق الملكية</h3>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-warning">الخصوم:</h4>
              
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

              <h4 className="font-semibold text-accent pt-4">حقوق الملكية:</h4>
              
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
              
              <div className="flex justify-between items-center pt-2 border-t-2 border-warning">
                <span className="font-bold text-lg">إجمالي الخصوم وحقوق الملكية:</span>
                <span className="font-mono font-bold text-lg text-warning">
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