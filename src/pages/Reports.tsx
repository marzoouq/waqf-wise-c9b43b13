import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveDashboard } from '@/components/reports/InteractiveDashboard';
import { ScheduledReportsManager } from '@/components/reports/ScheduledReportsManager';
import { CustomReportBuilder } from '@/components/reports/CustomReportBuilder';
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
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
import { BarChart3, Calendar, Settings, Users, Building2, FileText, DollarSign, Wand2 } from "lucide-react";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";

const Reports = () => {
  return (
    <PageErrorBoundary pageName="التقارير">
      <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="التقارير والإحصائيات"
        description="تقارير تحليلية شاملة ومتقدمة"
        icon={<BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
      />

      <div className="space-y-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-1">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              لوحة التحكم
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-2">
              <Calendar className="h-4 w-4" />
              جدولة
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
            <ScheduledReportsManager />
          </TabsContent>

          <TabsContent value="builder">
            <CustomReportBuilder />
          </TabsContent>

          <TabsContent value="beneficiaries">
            <BeneficiaryReports />
          </TabsContent>

          <TabsContent value="properties">
            <PropertiesReports />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Tabs defaultValue="income" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="income">قائمة الدخل</TabsTrigger>
                <TabsTrigger value="balance">الميزانية</TabsTrigger>
                <TabsTrigger value="trial">ميزان المراجعة</TabsTrigger>
                <TabsTrigger value="cashflow">التدفقات النقدية</TabsTrigger>
              </TabsList>

              <TabsContent value="income">
                <EnhancedIncomeStatement />
              </TabsContent>

              <TabsContent value="balance">
                <EnhancedBalanceSheet />
              </TabsContent>

              <TabsContent value="trial">
                <TrialBalanceReport />
              </TabsContent>

              <TabsContent value="cashflow">
                <CashFlowStatement />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Tabs defaultValue="accounting" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="accounting">الربط المحاسبي</TabsTrigger>
                <TabsTrigger value="distributions">تحليل التوزيعات</TabsTrigger>
                <TabsTrigger value="loans">أعمار الديون</TabsTrigger>
                <TabsTrigger value="maintenance">تكاليف الصيانة</TabsTrigger>
              </TabsList>

              <TabsContent value="accounting">
                <AccountingLinkReport />
              </TabsContent>

              <TabsContent value="distributions">
                <DistributionAnalysisReport />
              </TabsContent>

              <TabsContent value="loans">
                <LoansAgingReport />
              </TabsContent>

              <TabsContent value="maintenance">
                <MaintenanceCostReport />
              </TabsContent>
            </Tabs>

            <FundsPerformanceReport />
          </TabsContent>
        </Tabs>
      </div>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Reports;
