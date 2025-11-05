import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomReportDialog } from "@/components/reports/CustomReportDialog";
import { IncomeStatement } from "@/components/reports/IncomeStatement";
import { BalanceSheet } from "@/components/reports/BalanceSheet";
import { useState } from "react";

const Reports = () => {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const handleGenerateCustomReport = (data: any) => {
    console.log("Generating custom report:", data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
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

        <Tabs defaultValue="income" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
            <TabsTrigger value="income">قائمة الدخل</TabsTrigger>
            <TabsTrigger value="balance">الميزانية العمومية</TabsTrigger>
            <TabsTrigger value="custom">تقارير مخصصة</TabsTrigger>
            <TabsTrigger value="distributions">التوزيعات</TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            <IncomeStatement />
          </TabsContent>

          <TabsContent value="balance" className="space-y-4">
            <BalanceSheet />
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            {/* Placeholder for custom reports */}
            <div className="text-center py-8">
              <p className="text-muted-foreground">التقارير المخصصة قيد التطوير</p>
            </div>
          </TabsContent>

          <TabsContent value="distributions" className="space-y-4">
            {/* Placeholder for distribution reports */}
            <div className="text-center py-8">
              <p className="text-muted-foreground">تقارير التوزيعات قيد التطوير</p>
            </div>
          </TabsContent>
        </Tabs>

        <CustomReportDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          onGenerate={handleGenerateCustomReport}
        />
      </div>
    </div>
  );
};

export default Reports;
