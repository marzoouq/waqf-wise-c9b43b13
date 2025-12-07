import { Mail, Coins, Globe, RefreshCw, Settings } from "lucide-react";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { CurrentFiscalYearCard, RevenueProgressCard } from "@/components/dashboard/shared";
import { useNazerDashboardRealtime, useNazerDashboardRefresh } from "@/hooks/dashboard/useNazerDashboardRealtime";
import { POSQuickAccessCard } from "@/components/pos";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function NazerDashboard() {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [controlSectionOpen, setControlSectionOpen] = useState(false);
  
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

        {/* السنة المالية وتقدم الإيرادات */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <CurrentFiscalYearCard />
          <RevenueProgressCard />
        </div>

        <Suspense fallback={<SectionSkeleton />}>
          <NazerKPIs />
        </Suspense>

        {/* بطاقات الرصيد البنكي ورقبة الوقف ونقطة البيع - تحديث مباشر */}
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

        {/* قسم التحكم بعرض المستفيدين - قابل للطي */}
        <Collapsible open={controlSectionOpen} onOpenChange={setControlSectionOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>التحكم بعرض المستفيدين والورثة</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {controlSectionOpen ? "إخفاء" : "عرض"}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <BeneficiaryControlSection />
          </CollapsibleContent>
        </Collapsible>
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