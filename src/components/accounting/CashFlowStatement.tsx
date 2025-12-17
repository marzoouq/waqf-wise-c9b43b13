import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, FileDown, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useCashFlowCalculation } from "@/hooks/accounting/useCashFlowCalculation";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyAccountingState } from "./EmptyAccountingState";
import { format, arLocale as ar } from "@/lib/date";
import { toast } from "sonner";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { loadArabicFontToPDF, addWaqfHeader, addWaqfFooter, WAQF_COLORS } from "@/lib/pdf/arabic-pdf-utils";

export function CashFlowStatement() {
  const { cashFlows, isLoading, isCalculating, latestFlow, handleCalculate } = useCashFlowCalculation();
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState message="جاري تحميل قائمة التدفقات النقدية..." />;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    if (!latestFlow) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // تحميل الخط العربي
      const fontName = await loadArabicFontToPDF(doc);
      
      // إضافة ترويسة الوقف
      let yPos = addWaqfHeader(doc, fontName, 'قائمة التدفقات النقدية');
      
      // الفترة
      doc.setFont(fontName, "normal");
      doc.setFontSize(10);
      doc.setTextColor(...WAQF_COLORS.muted);
      const pageWidth = doc.internal.pageSize.width;
      const periodText = `من ${format(new Date(latestFlow.period_start), "dd/MM/yyyy")} إلى ${format(new Date(latestFlow.period_end), "dd/MM/yyyy")}`;
      doc.text(periodText, pageWidth / 2, yPos, { align: "center" });
      yPos += 15;
      
      // التدفقات التشغيلية
      doc.setFont(fontName, "bold");
      doc.setFontSize(12);
      doc.setTextColor(...WAQF_COLORS.primary);
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPos - 5, 180, 10, "F");
      doc.text("التدفقات النقدية من الأنشطة التشغيلية", pageWidth - 20, yPos, { align: "right" });
      yPos += 12;
      
      doc.setFont(fontName, "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("صافي التدفقات التشغيلية:", pageWidth - 25, yPos, { align: "right" });
      doc.text(`${formatNumber(latestFlow.operating_activities)} ر.س`, 25, yPos, { align: "left" });
      yPos += 15;
      
      // التدفقات الاستثمارية
      doc.setFont(fontName, "bold");
      doc.setFontSize(12);
      doc.setTextColor(...WAQF_COLORS.primary);
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPos - 5, 180, 10, "F");
      doc.text("التدفقات النقدية من الأنشطة الاستثمارية", pageWidth - 20, yPos, { align: "right" });
      yPos += 12;
      
      doc.setFont(fontName, "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("صافي التدفقات الاستثمارية:", pageWidth - 25, yPos, { align: "right" });
      doc.text(`${formatNumber(latestFlow.investing_activities)} ر.س`, 25, yPos, { align: "left" });
      yPos += 15;
      
      // التدفقات التمويلية
      doc.setFont(fontName, "bold");
      doc.setFontSize(12);
      doc.setTextColor(...WAQF_COLORS.primary);
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPos - 5, 180, 10, "F");
      doc.text("التدفقات النقدية من الأنشطة التمويلية", pageWidth - 20, yPos, { align: "right" });
      yPos += 12;
      
      doc.setFont(fontName, "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("صافي التدفقات التمويلية:", pageWidth - 25, yPos, { align: "right" });
      doc.text(`${formatNumber(latestFlow.financing_activities)} ر.س`, 25, yPos, { align: "left" });
      yPos += 20;
      
      // خط فاصل
      doc.setLineWidth(0.5);
      doc.setDrawColor(...WAQF_COLORS.primary);
      doc.line(15, yPos, 195, yPos);
      yPos += 10;
      
      // صافي التدفق النقدي
      doc.setFont(fontName, "bold");
      doc.setFontSize(14);
      doc.text("صافي التغير في النقد:", pageWidth - 20, yPos, { align: "right" });
      if (latestFlow.net_cash_flow >= 0) {
        doc.setTextColor(0, 150, 0);
      } else {
        doc.setTextColor(200, 0, 0);
      }
      doc.text(`${formatNumber(latestFlow.net_cash_flow)} ر.س`, 25, yPos, { align: "left" });
      doc.setTextColor(0, 0, 0);
      yPos += 12;
      
      // النقد في بداية ونهاية الفترة
      doc.setFont(fontName, "normal");
      doc.setFontSize(10);
      doc.text("النقد في بداية الفترة:", pageWidth - 25, yPos, { align: "right" });
      doc.text(`${formatNumber(latestFlow.opening_cash)} ر.س`, 25, yPos, { align: "left" });
      yPos += 8;
      
      doc.setFont(fontName, "bold");
      doc.text("النقد في نهاية الفترة:", pageWidth - 25, yPos, { align: "right" });
      doc.setTextColor(...WAQF_COLORS.primary);
      doc.text(`${formatNumber(latestFlow.closing_cash)} ر.س`, 25, yPos, { align: "left" });
      
      // إضافة التذييل
      addWaqfFooter(doc, fontName);
      
      const filename = `قائمة-التدفقات-النقدية-${format(new Date(), "yyyyMMdd-HHmmss")}.pdf`;
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
            <Printer className="h-3 w-3 sm:h-4 sm:w-4 ms-2" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm">
            <FileDown className="h-3 w-3 sm:h-4 sm:w-4 ms-2" />
            تصدير PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="space-y-4 sm:space-y-6">
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
