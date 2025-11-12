import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedIncomeStatement } from "@/components/accounting/EnhancedIncomeStatement";
import { EnhancedBalanceSheet } from "@/components/accounting/EnhancedBalanceSheet";
import { TrialBalanceReport } from "@/components/accounting/TrialBalanceReport";
import { CashFlowStatement } from "@/components/accounting/CashFlowStatement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const Reports = () => {
  const { toast } = useToast();

  // Fetch distributions for reports
  const { data: distributions = [] } = useQuery({
    queryKey: ["distributions_report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distributions")
        .select("*")
        .order("distribution_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleExportPDF = (reportName: string) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica");
      doc.text(`${reportName}`, 20, 20);
      doc.text(`التاريخ: ${new Date().toLocaleDateString("ar-SA")}`, 20, 30);
      doc.save(`${reportName}_${Date.now()}.pdf`);
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير التقرير بصيغة PDF",
      });
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير التقرير",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = (reportName: string, data: any[]) => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, `${reportName}_${Date.now()}.xlsx`);
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير التقرير بصيغة Excel",
      });
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير التقرير",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary">
              التقارير والإحصائيات
            </h1>
            <p className="text-muted-foreground mt-1">
              تقارير مالية شاملة ومفصلة
            </p>
          </div>
        </div>

        <Tabs defaultValue="trial-balance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="trial-balance">ميزان المراجعة</TabsTrigger>
            <TabsTrigger value="balance-sheet">الميزانية العمومية</TabsTrigger>
            <TabsTrigger value="income">قائمة الدخل</TabsTrigger>
            <TabsTrigger value="cash-flow">التدفقات النقدية</TabsTrigger>
            <TabsTrigger value="distributions">التوزيعات</TabsTrigger>
          </TabsList>

          <TabsContent value="trial-balance" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button onClick={() => handleExportPDF("ميزان المراجعة")} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير PDF
              </Button>
              <Button onClick={() => handleExportExcel("ميزان المراجعة", [])} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير Excel
              </Button>
            </div>
            <TrialBalanceReport />
          </TabsContent>

          <TabsContent value="balance-sheet" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button onClick={() => handleExportPDF("الميزانية العمومية")} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير PDF
              </Button>
              <Button onClick={() => handleExportExcel("الميزانية العمومية", [])} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير Excel
              </Button>
            </div>
            <EnhancedBalanceSheet />
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button onClick={() => handleExportPDF("قائمة الدخل")} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير PDF
              </Button>
              <Button onClick={() => handleExportExcel("قائمة الدخل", [])} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير Excel
              </Button>
            </div>
            <EnhancedIncomeStatement />
          </TabsContent>

          <TabsContent value="cash-flow" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button onClick={() => handleExportPDF("قائمة التدفقات النقدية")} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير PDF
              </Button>
              <Button onClick={() => handleExportExcel("قائمة التدفقات النقدية", [])} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير Excel
              </Button>
            </div>
            <CashFlowStatement />
          </TabsContent>

          <TabsContent value="distributions" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button onClick={() => handleExportPDF("تقرير التوزيعات")} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير PDF
              </Button>
              <Button onClick={() => handleExportExcel("تقرير التوزيعات", distributions)} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير Excel
              </Button>
            </div>
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>تقرير التوزيعات</CardTitle>
              </CardHeader>
              <CardContent>
                {distributions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">لا توجد توزيعات بعد</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-right py-3 px-4 font-semibold">الشهر</th>
                          <th className="text-right py-3 px-4 font-semibold">التاريخ</th>
                          <th className="text-right py-3 px-4 font-semibold">عدد المستفيدين</th>
                          <th className="text-right py-3 px-4 font-semibold">المبلغ الإجمالي</th>
                          <th className="text-right py-3 px-4 font-semibold">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {distributions.map((dist: any) => (
                          <tr key={dist.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4">{dist.month}</td>
                            <td className="py-3 px-4">
                              {new Date(dist.distribution_date).toLocaleDateString("ar-SA")}
                            </td>
                            <td className="py-3 px-4">{dist.beneficiaries_count}</td>
                            <td className="py-3 px-4 font-semibold text-primary">
                              {Number(dist.total_amount).toLocaleString("ar-SA")} ر.س
                            </td>
                            <td className="py-3 px-4">{dist.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
