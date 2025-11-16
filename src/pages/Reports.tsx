import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveDashboard } from '@/components/reports/InteractiveDashboard';
import { ScheduledReports } from '@/components/reports/ScheduledReports';
import { ReportBuilder } from '@/components/reports/ReportBuilder';
import { BeneficiaryReports } from '@/components/reports/BeneficiaryReports';
import { PropertiesReports } from '@/components/reports/PropertiesReports';
import { EnhancedIncomeStatement } from "@/components/accounting/EnhancedIncomeStatement";
import { EnhancedBalanceSheet } from "@/components/accounting/EnhancedBalanceSheet";
import { TrialBalanceReport } from "@/components/accounting/TrialBalanceReport";
import { CashFlowStatement } from "@/components/accounting/CashFlowStatement";
import { AccountingLinkReport } from "@/components/reports/AccountingLinkReport";
import { DistributionAnalysisReport } from "@/components/reports/DistributionAnalysisReport";
import { LoansAgingReport } from "@/components/reports/LoansAgingReport";
import { MaintenanceCostReport } from "@/components/reports/MaintenanceCostReport";
import { FundsPerformanceReport } from "@/components/reports/FundsPerformanceReport";
import { BarChart3, Calendar, Settings, Users, Building2, FileText, DollarSign } from "lucide-react";

const Reports = () => {

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary">
            التقارير والإحصائيات
          </h1>
          <p className="text-muted-foreground mt-1">
            تقارير تحليلية شاملة ومتقدمة
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-1">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              لوحة التحكم
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-2">
              <Calendar className="h-4 w-4" />
              جدولة التقارير
            </TabsTrigger>
            <TabsTrigger value="builder" className="gap-2">
              <Settings className="h-4 w-4" />
              منشئ التقارير
            </TabsTrigger>
            <TabsTrigger value="beneficiaries" className="gap-2">
              <Users className="h-4 w-4" />
              المستفيدون
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-2">
              <Building2 className="h-4 w-4" />
              العقارات
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2">
              <DollarSign className="h-4 w-4" />
              المالية
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2">
              <FileText className="h-4 w-4" />
              التحليلات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <InteractiveDashboard />
          </TabsContent>

          <TabsContent value="scheduled">
            <ScheduledReports />
          </TabsContent>

          <TabsContent value="builder">
            <ReportBuilder />
          </TabsContent>

          <TabsContent value="beneficiaries">
            <BeneficiaryReports />
          </TabsContent>

          <TabsContent value="properties">
            <PropertiesReports />
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <Tabs defaultValue="trial-balance">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
                <TabsTrigger value="trial-balance">ميزان المراجعة</TabsTrigger>
                <TabsTrigger value="balance-sheet">الميزانية</TabsTrigger>
                <TabsTrigger value="income">قائمة الدخل</TabsTrigger>
                <TabsTrigger value="cash-flow">التدفقات</TabsTrigger>
              </TabsList>

              <TabsContent value="trial-balance">
                <TrialBalanceReport />
              </TabsContent>

              <TabsContent value="balance-sheet">
                <EnhancedBalanceSheet />
              </TabsContent>

              <TabsContent value="income">
                <EnhancedIncomeStatement />
              </TabsContent>

              <TabsContent value="cash-flow">
                <CashFlowStatement />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Tabs defaultValue="accounting-link">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
                <TabsTrigger value="accounting-link">الربط المحاسبي</TabsTrigger>
                <TabsTrigger value="distributions">تحليل التوزيعات</TabsTrigger>
                <TabsTrigger value="loans">أعمار الديون</TabsTrigger>
                <TabsTrigger value="funds">أداء المصارف</TabsTrigger>
              </TabsList>

              <TabsContent value="accounting-link">
                <AccountingLinkReport />
              </TabsContent>

              <TabsContent value="distributions">
                <DistributionAnalysisReport />
              </TabsContent>

              <TabsContent value="loans">
                <LoansAgingReport />
              </TabsContent>

              <TabsContent value="funds">
                <FundsPerformanceReport />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
