import { Mail, Coins, Globe, RefreshCw, Settings, Users, FileText, Activity } from "lucide-react";
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
import { BankBalanceCard } from "@/components/shared/BankBalanceCard";
import { WaqfCorpusCard } from "@/components/shared/WaqfCorpusCard";
import { DistributeRevenueDialog } from "@/components/nazer/DistributeRevenueDialog";
import { PublishFiscalYearDialog } from "@/components/nazer/PublishFiscalYearDialog";
import { FiscalYearPublishStatus } from "@/components/nazer/FiscalYearPublishStatus";
import { BeneficiaryControlSection } from "@/components/nazer/BeneficiaryControlSection";
import { NazerBeneficiaryManagement } from "@/components/nazer/NazerBeneficiaryManagement";
import { NazerReportsSection } from "@/components/nazer/NazerReportsSection";
import { NazerSystemOverview } from "@/components/nazer/NazerSystemOverview";
import { CurrentFiscalYearCard, RevenueProgressCard } from "@/components/dashboard/shared";
import { useNazerDashboardRealtime, useNazerDashboardRefresh } from "@/hooks/dashboard/useNazerDashboardRealtime";
import { POSQuickAccessCard } from "@/components/pos";

export default function NazerDashboard() {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // تفعيل التحديثات المباشرة الموحدة
  useNazerDashboardRealtime();
  const { refreshAll } = useNazerDashboardRefresh();

  return (
    <UnifiedDashboardLayout
      role="nazer"
      actions={
        <div className="flex items-center gap-2">
          <Button onClick={refreshAll} variant="ghost" size="icon" title="تحديث البيانات">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setDistributeDialogOpen(true)} className="gap-2" variant="default">
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">توزيع الغلة</span>
          </Button>
          <Button onClick={() => setPublishDialogOpen(true)} className="gap-2" variant="outline">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">نشر السنة</span>
          </Button>
          <Button onClick={() => setMessageDialogOpen(true)} className="gap-2" variant="ghost">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">رسالة</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* حالة نشر السنة المالية */}
        <FiscalYearPublishStatus onPublishClick={() => setPublishDialogOpen(true)} />

        {/* تبويبات لوحة التحكم الشاملة */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="beneficiaries" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">المستفيدون</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">التقارير</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">التحكم</span>
            </TabsTrigger>
          </TabsList>

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
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
              <BankBalanceCard />
              <WaqfCorpusCard />
              <POSQuickAccessCard />
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              <Suspense fallback={<ChartSkeleton />}>
                <PendingApprovalsSection />
              </Suspense>
              <Suspense fallback={<ChartSkeleton />}>
                <SmartAlertsSection />
              </Suspense>
            </div>

            <Suspense fallback={<ChartSkeleton />}>
              <AIInsightsWidget />
            </Suspense>

            <Suspense fallback={<ChartSkeleton />}>
              <QuickActionsGrid />
            </Suspense>
          </TabsContent>

          {/* تبويب المستفيدين */}
          <TabsContent value="beneficiaries" className="space-y-6">
            <Suspense fallback={<SectionSkeleton />}>
              <NazerSystemOverview />
            </Suspense>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              <Suspense fallback={<ChartSkeleton />}>
                <NazerBeneficiaryManagement />
              </Suspense>
              <Suspense fallback={<ChartSkeleton />}>
                <PendingApprovalsSection />
              </Suspense>
            </div>
          </TabsContent>

          {/* تبويب التقارير */}
          <TabsContent value="reports" className="space-y-6">
            <Suspense fallback={<SectionSkeleton />}>
              <NazerReportsSection />
            </Suspense>
          </TabsContent>

          {/* تبويب التحكم */}
          <TabsContent value="settings" className="space-y-6">
            <Suspense fallback={<SectionSkeleton />}>
              <BeneficiaryControlSection />
            </Suspense>
          </TabsContent>
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