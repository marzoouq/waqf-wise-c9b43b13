import { Mail, Coins, Globe, Settings, Users, FileText, Activity } from "lucide-react";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSendMessageDialog } from "@/components/messages/AdminSendMessageDialog";
import { ChartSkeleton, SectionSkeleton } from "@/components/dashboard";
import { UnifiedDashboardLayout } from "@/components/dashboard/UnifiedDashboardLayout";
import PendingApprovalsSection from "@/components/dashboard/nazer/PendingApprovalsSection";
import NazerKPIs from "@/components/dashboard/nazer/NazerKPIs";
import SmartAlertsSection from "@/components/dashboard/nazer/SmartAlertsSection";
import QuickActionsGrid from "@/components/dashboard/nazer/QuickActionsGrid";
import { AIInsightsWidget } from "@/components/dashboard/AIInsightsWidget";
import { DistributeRevenueDialog } from "@/components/nazer/DistributeRevenueDialog";
import { PublishFiscalYearDialog } from "@/components/nazer/PublishFiscalYearDialog";
import { FiscalYearPublishStatus } from "@/components/nazer/FiscalYearPublishStatus";
import { BeneficiaryControlSection } from "@/components/nazer/BeneficiaryControlSection";
import { NazerBeneficiaryManagement } from "@/components/nazer/NazerBeneficiaryManagement";
import { NazerReportsSection } from "@/components/nazer/NazerReportsSection";
import { NazerSystemOverview } from "@/components/nazer/NazerSystemOverview";
import { BeneficiaryActivityMonitor } from "@/components/nazer/BeneficiaryActivityMonitor";
import { PreviewAsBeneficiaryButton } from "@/components/nazer/PreviewAsBeneficiaryButton";
import { LastSyncIndicator } from "@/components/nazer/LastSyncIndicator";
import { NazerAnalyticsSection } from "@/components/nazer/NazerAnalyticsSection";
import { CurrentFiscalYearCard, RevenueProgressCard, FinancialCardsRow } from "@/components/dashboard/shared";
import { LazyTabContent } from "@/components/dashboard/admin/LazyTabContent";
import { useNazerDashboardRealtime, useNazerDashboardRefresh } from "@/hooks/dashboard/useNazerDashboardRealtime";
import { useUnifiedKPIs } from "@/hooks/dashboard/useUnifiedKPIs";

export default function NazerDashboard() {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // تفعيل التحديثات المباشرة الموحدة
  useNazerDashboardRealtime();
  const { refreshAll } = useNazerDashboardRefresh();
  const { lastUpdated } = useUnifiedKPIs();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshAll();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <UnifiedDashboardLayout
      role="nazer"
      actions={
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* مؤشر آخر تحديث */}
          <LastSyncIndicator 
            lastUpdated={lastUpdated} 
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            className="hidden md:flex"
          />
          
          {/* زر معاينة كـ مستفيد */}
          <PreviewAsBeneficiaryButton />
          
          <Button onClick={() => setDistributeDialogOpen(true)} className="gap-1.5 sm:gap-2 px-2 sm:px-3" variant="default" size="sm">
            <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline text-xs sm:text-sm">توزيع</span>
            <span className="hidden sm:inline text-sm"> الغلة</span>
          </Button>
          <Button onClick={() => setPublishDialogOpen(true)} className="gap-1.5 sm:gap-2 px-2 sm:px-3" variant="outline" size="sm">
            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline text-xs sm:text-sm">نشر</span>
          </Button>
          <Button onClick={() => setMessageDialogOpen(true)} className="gap-1.5 sm:gap-2 px-2 sm:px-3" variant="ghost" size="sm">
            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline text-sm">رسالة</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* حالة نشر السنة المالية */}
        <FiscalYearPublishStatus onPublishClick={() => setPublishDialogOpen(true)} />

        {/* تبويبات لوحة التحكم الشاملة */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-4 mb-4 min-w-full sm:min-w-0">
              <TabsTrigger value="overview" className="gap-1.5 sm:gap-2 px-3 sm:px-4 whitespace-nowrap">
                <Activity className="h-4 w-4" />
                <span className="text-xs sm:text-sm">نظرة عامة</span>
              </TabsTrigger>
              <TabsTrigger value="beneficiaries" className="gap-1.5 sm:gap-2 px-3 sm:px-4 whitespace-nowrap">
                <Users className="h-4 w-4" />
                <span className="text-xs sm:text-sm">المستفيدون</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-1.5 sm:gap-2 px-3 sm:px-4 whitespace-nowrap">
                <FileText className="h-4 w-4" />
                <span className="text-xs sm:text-sm">التقارير</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5 sm:gap-2 px-3 sm:px-4 whitespace-nowrap">
                <Settings className="h-4 w-4" />
                <span className="text-xs sm:text-sm">التحكم</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* تبويب نظرة عامة */}
          <TabsContent value="overview" className="space-y-6">
            {/* السنة المالية وتقدم الإيرادات */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              <CurrentFiscalYearCard />
              <RevenueProgressCard />
            </div>

            <Suspense fallback={<SectionSkeleton />}>
              <NazerKPIs />
            </Suspense>

            {/* بطاقات الرصيد البنكي ورقبة الوقف ونقطة البيع */}
            <FinancialCardsRow />

            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              <Suspense fallback={<ChartSkeleton />}>
                <PendingApprovalsSection />
              </Suspense>
              <Suspense fallback={<ChartSkeleton />}>
                <SmartAlertsSection />
              </Suspense>
            </div>

            {/* قسم الرسوم البيانية التحليلية */}
            <Suspense fallback={<ChartSkeleton />}>
              <NazerAnalyticsSection />
            </Suspense>

            <Suspense fallback={<ChartSkeleton />}>
              <AIInsightsWidget />
            </Suspense>

            <Suspense fallback={<ChartSkeleton />}>
              <QuickActionsGrid />
            </Suspense>
          </TabsContent>

          {/* تبويب المستفيدين - تحميل كسول */}
          <LazyTabContent isActive={activeTab === "beneficiaries"}>
            <div className="space-y-6">
              <Suspense fallback={<SectionSkeleton />}>
                <NazerSystemOverview />
              </Suspense>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                <Suspense fallback={<ChartSkeleton />}>
                  <NazerBeneficiaryManagement />
                </Suspense>
                <Suspense fallback={<ChartSkeleton />}>
                  <BeneficiaryActivityMonitor />
                </Suspense>
              </div>
            </div>
          </LazyTabContent>

          {/* تبويب التقارير - تحميل كسول */}
          <LazyTabContent isActive={activeTab === "reports"}>
            <div className="space-y-6">
              <Suspense fallback={<SectionSkeleton />}>
                <NazerReportsSection />
              </Suspense>
            </div>
          </LazyTabContent>

          {/* تبويب التحكم - تحميل كسول */}
          <LazyTabContent isActive={activeTab === "settings"}>
            <div className="space-y-6">
              <Suspense fallback={<SectionSkeleton />}>
                <BeneficiaryControlSection />
              </Suspense>
            </div>
          </LazyTabContent>
        </Tabs>
      </div>

      <AdminSendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
      />

      <DistributeRevenueDialog
        open={distributeDialogOpen}
        onOpenChange={setDistributeDialogOpen}
      />

      <PublishFiscalYearDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
      />
    </UnifiedDashboardLayout>
  );
}
