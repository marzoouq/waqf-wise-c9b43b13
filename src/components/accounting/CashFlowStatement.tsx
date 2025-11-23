import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, FileDown, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useCashFlows } from "@/hooks/useCashFlows";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyAccountingState } from "./EmptyAccountingState";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { productionLogger } from "@/lib/logger/production-logger";

export function CashFlowStatement() {
  const { cashFlows, isLoading, calculateCashFlow } = useCashFlows();
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  if (isLoading) {
    return <LoadingState message="جاري تحميل قائمة التدفقات النقدية..." />;
  }

  const latestFlow = cashFlows[0];

  // Using formatCurrency and formatNumber from @/lib/utils

  const handlePrint = () => {
    window.print();
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      // الحصول على السنة المالية النشطة
      const { data: fiscalYear } = await supabase
        .from("fiscal_years")
        .select("*")
        .eq("is_active", true)
        .single();

      if (!fiscalYear) {
        toast.error("لا توجد سنة مالية نشطة");
        return;
      }

      await calculateCashFlow({
        fiscalYearId: fiscalYear.id,
        periodStart: fiscalYear.start_date,
        periodEnd: fiscalYear.end_date,
      });
    } catch (error) {
      productionLogger.error("Error calculating cash flow", error, {
        context: 'CashFlowStatement',
        severity: 'medium',
      });
      toast.error("حدث خطأ أثناء حساب التدفقات النقدية");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExport = () => {
    if (!latestFlow) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    try {
      const doc = new jsPDF();
      
      // إعداد الخط - استخدام خط يدعم العربية
      doc.setFont("helvetica");
      doc.setFontSize(18);
      
      // العنوان الرئيسي
      doc.text("قائمة التدفقات النقدية", 105, 20, { align: "center" });
      
      // الفترة الزمنية
      doc.setFontSize(10);
      const periodText = `من ${format(new Date(latestFlow.period_start), "dd/MM/yyyy")} إلى ${format(new Date(latestFlow.period_end), "dd/MM/yyyy")}`;
      doc.text(periodText, 105, 30, { align: "center" });
      
      doc.setFontSize(12);
      let yPos = 50;
      
      // الأنشطة التشغيلية
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPos - 5, 180, 10, "F");
      doc.text("Operating Activities", 20, yPos);
      yPos += 15;
      
      doc.setFontSize(10);
      doc.text("Net Operating Cash Flow:", 20, yPos);
      doc.text(`${formatNumber(latestFlow.operating_activities)} SAR`, 150, yPos);
      yPos += 20;
      
      // الأنشطة الاستثمارية
      doc.setFontSize(12);
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPos - 5, 180, 10, "F");
      doc.text("Investing Activities", 20, yPos);
      yPos += 15;
      
      doc.setFontSize(10);
      doc.text("Net Investing Cash Flow:", 20, yPos);
      doc.text(`${formatNumber(latestFlow.investing_activities)} SAR`, 150, yPos);
      yPos += 20;
      
      // الأنشطة التمويلية
      doc.setFontSize(12);
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPos - 5, 180, 10, "F");
      doc.text("Financing Activities", 20, yPos);
      yPos += 15;
      
      doc.setFontSize(10);
      doc.text("Net Financing Cash Flow:", 20, yPos);
      doc.text(`${formatNumber(latestFlow.financing_activities)} SAR`, 150, yPos);
      yPos += 25;
      
      // خط فاصل
      doc.setLineWidth(0.5);
      doc.line(15, yPos, 195, yPos);
      yPos += 10;
      
      // صافي التدفق النقدي
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Net Cash Flow:", 20, yPos);
      if (latestFlow.net_cash_flow >= 0) {
        doc.setTextColor(0, 150, 0);
      } else {
        doc.setTextColor(200, 0, 0);
      }
      doc.text(`${formatNumber(latestFlow.net_cash_flow)} SAR`, 150, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 15;
      
      // النقد في بداية ونهاية الفترة
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Opening Cash:", 20, yPos);
      doc.text(`${formatNumber(latestFlow.opening_cash)} SAR`, 150, yPos);
      yPos += 10;
      
      doc.text("Closing Cash:", 20, yPos);
      doc.text(`${formatNumber(latestFlow.closing_cash)} SAR`, 150, yPos);
      yPos += 15;
      
      // تاريخ التصدير
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Export Date: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 105, 280, { align: "center" });
      
      // حفظ الملف
      const filename = `cash-flow-statement-${format(new Date(), "yyyyMMdd-HHmmss")}.pdf`;
      doc.save(filename);
      
      toast.success("تم تصدير قائمة التدفقات النقدية بنجاح", {
        description: `تم حفظ الملف: ${filename}`,
      });
    } catch (error) {
      toast.error("حدث خطأ أثناء تصدير PDF", {
        description: "الرجاء المحاولة مرة أخرى",
      });
    }
  };

  if (!latestFlow) {
    return (
      <EmptyAccountingState
        icon={<Activity className="h-12 w-12" />}
        title="لا توجد بيانات متاحة"
        description="قم بحساب التدفقات النقدية للفترة المالية لعرض البيانات"
        actionLabel={isCalculating ? "جاري الحساب..." : "حساب التدفقات النقدية"}
        onAction={handleCalculate}
      />
    );
  }

  return (
    <Card className="print:shadow-none">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:border-b p-3 sm:p-4 md:p-6">
        <div>
          <CardTitle className="text-xl sm:text-2xl md:text-2xl">قائمة التدفقات النقدية</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            من {format(new Date(latestFlow.period_start), "dd MMMM yyyy", { locale: ar })} إلى{" "}
            {format(new Date(latestFlow.period_end), "dd MMMM yyyy", { locale: ar })}
          </p>
        </div>
        <div className="flex gap-2 print:hidden flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs sm:text-sm">
            <Printer className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm">
            <FileDown className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
            تصدير PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="space-y-4 sm:space-y-6">
          {/* التدفقات النقدية من الأنشطة التشغيلية */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">التدفقات النقدية من الأنشطة التشغيلية</h3>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">صافي التدفقات التشغيلية</span>
              <div className="flex items-center gap-2">
                {latestFlow.operating_activities >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={`font-semibold ${
                    latestFlow.operating_activities >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {formatCurrency(latestFlow.operating_activities)}
                </span>
              </div>
            </div>
          </div>

          {/* التدفقات النقدية من الأنشطة الاستثمارية */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-info" />
              <h3 className="text-lg font-semibold">التدفقات النقدية من الأنشطة الاستثمارية</h3>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">صافي التدفقات الاستثمارية</span>
              <div className="flex items-center gap-2">
                {latestFlow.investing_activities >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={`font-semibold ${
                    latestFlow.investing_activities >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {formatCurrency(latestFlow.investing_activities)}
                </span>
              </div>
            </div>
          </div>

          {/* التدفقات النقدية من الأنشطة التمويلية */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">التدفقات النقدية من الأنشطة التمويلية</h3>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">صافي التدفقات التمويلية</span>
              <div className="flex items-center gap-2">
                {latestFlow.financing_activities >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={`font-semibold ${
                    latestFlow.financing_activities >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {formatCurrency(latestFlow.financing_activities)}
                </span>
              </div>
            </div>
          </div>

          {/* الملخص النهائي */}
          <div className="border-t-2 pt-6 mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">النقد في بداية الفترة</span>
                <span className="font-semibold">{formatCurrency(latestFlow.opening_cash)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">صافي التغير في النقد</span>
                <span
                  className={`font-semibold ${
                    latestFlow.net_cash_flow >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {formatCurrency(latestFlow.net_cash_flow)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-primary/10 rounded-lg px-4 border-2 border-primary">
                <span className="text-lg font-bold">النقد في نهاية الفترة</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(latestFlow.closing_cash)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
