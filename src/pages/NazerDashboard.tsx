import { Mail } from "lucide-react";
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

export default function NazerDashboard() {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  return (
    <UnifiedDashboardLayout
      role="nazer"
      actions={
        <Button onClick={() => setMessageDialogOpen(true)} className="gap-2">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">إرسال رسالة</span>
        </Button>
      }
    >
      <div className="space-y-6">
        <Suspense fallback={<SectionSkeleton />}>
          <NazerKPIs />
        </Suspense>

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
      </div>

      <AdminSendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
      />
    </UnifiedDashboardLayout>
  );
}
