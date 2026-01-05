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
import { DetailedGeneralLedger } from "@/components/reports/DetailedGeneralLedger";
import { AgingReport } from "@/components/reports/AgingReport";
import { ZATCASettings, ZATCAComplianceChecker } from "@/components/zatca";
import { BarChart3, Calendar, Settings, Users, Building2, FileText, DollarSign, ShieldCheck } from "lucide-react";
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
          <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-full min-w-max sm:grid sm:grid-cols-3 lg:grid-cols-8 gap-1">
              <TabsTrigger value="dashboard" className="gap-1 px-2 sm:px-3 text-xs sm:text-sm">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">لوحة التحكم</span>
                <span className="sm:hidden">لوحة</span>
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="gap-1 px-2 sm:px-3 text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">جدولة</span>
                <span className="sm:hidden">جدول</span>
              </TabsTrigger>
              <TabsTrigger value="builder" className="gap-1 px-2 sm:px-3 text-xs sm:text-sm">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">منشئ التقارير</span>
                <span className="sm:hidden">منشئ</span>
              </TabsTrigger>
              <TabsTrigger value="beneficiaries" className="gap-1 px-2 sm:px-3 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">المستفيدون</span>
                <span className="sm:hidden">مستفيد</span>
              </TabsTrigger>
              <TabsTrigger value="properties" className="gap-1 px-2 sm:px-3 text-xs sm:text-sm">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">العقارات</span>
                <span className="sm:hidden">عقار</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="gap-1 px-2 sm:px-3 text-xs sm:text-sm">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">المالية</span>
                <span className="sm:hidden">مالي</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-1 px-2 sm:px-3 text-xs sm:text-sm">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">التحليلات</span>
                <span className="sm:hidden">تحليل</span>
              </TabsTrigger>
              <TabsTrigger value="zatca" className="gap-1 px-2 sm:px-3 text-xs sm:text-sm">
                <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                ZATCA
              </TabsTrigger>
            </TabsList>
          </div>

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
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-4 h-auto">
                  <TabsTrigger value="income" className="text-xs sm:text-sm px-3 py-2">قائمة الدخل</TabsTrigger>
                  <TabsTrigger value="balance" className="text-xs sm:text-sm px-3 py-2">الميزانية</TabsTrigger>
                  <TabsTrigger value="trial" className="text-xs sm:text-sm px-3 py-2">ميزان المراجعة</TabsTrigger>
                  <TabsTrigger value="cashflow" className="text-xs sm:text-sm px-3 py-2">التدفقات النقدية</TabsTrigger>
                </TabsList>
              </div>

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
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-5 h-auto">
                  <TabsTrigger value="accounting" className="text-xs sm:text-sm px-2 sm:px-3 py-2">الربط المحاسبي</TabsTrigger>
                  <TabsTrigger value="distributions" className="text-xs sm:text-sm px-2 sm:px-3 py-2">تحليل التوزيعات</TabsTrigger>
                  <TabsTrigger value="loans" className="text-xs sm:text-sm px-2 sm:px-3 py-2">أعمار الديون</TabsTrigger>
                  <TabsTrigger value="maintenance" className="text-xs sm:text-sm px-2 sm:px-3 py-2">تكاليف الصيانة</TabsTrigger>
                  <TabsTrigger value="ledger" className="text-xs sm:text-sm px-2 sm:px-3 py-2">دفتر الأستاذ</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="accounting">
                <AccountingLinkReport />
              </TabsContent>

              <TabsContent value="distributions">
                <DistributionAnalysisReport />
              </TabsContent>

              <TabsContent value="loans">
                <div className="space-y-4">
                  <LoansAgingReport />
                  <AgingReport />
                </div>
              </TabsContent>

              <TabsContent value="maintenance">
                <MaintenanceCostReport />
              </TabsContent>

              <TabsContent value="ledger">
                <DetailedGeneralLedger />
              </TabsContent>
            </Tabs>

            <FundsPerformanceReport />
          </TabsContent>


          <TabsContent value="zatca" className="space-y-6">
            <Tabs defaultValue="compliance" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="compliance" className="text-xs sm:text-sm py-2">فحص الامتثال</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm py-2">الإعدادات</TabsTrigger>
              </TabsList>

              <TabsContent value="compliance">
                <ZATCAComplianceChecker />
              </TabsContent>

              <TabsContent value="settings">
                <ZATCASettings />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Reports;
