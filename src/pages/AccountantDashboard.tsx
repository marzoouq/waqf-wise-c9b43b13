import { useState, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FileText, AlertCircle, TrendingUp, FileCheck, FileClock, LayoutDashboard, Mail, RefreshCw } from "lucide-react";
import { useAccountantKPIs, useAccountantDashboardData } from "@/hooks/accounting";
import { ApproveJournalDialog } from "@/components/accounting/ApproveJournalDialog";
import { UnifiedDashboardLayout } from "@/components/dashboard/UnifiedDashboardLayout";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { SectionSkeleton } from "@/components/dashboard";
import { AdminSendMessageDialog } from "@/components/messages/AdminSendMessageDialog";
import { JournalApproval } from "@/types/approvals";
import { BankBalanceCard } from "@/components/shared/BankBalanceCard";
import { WaqfCorpusCard } from "@/components/shared/WaqfCorpusCard";
import { CurrentFiscalYearCard, RevenueProgressCard, FinancialCardsRow } from "@/components/dashboard/shared";
import { PendingApprovalsList, QuickActionsGrid } from "@/components/dashboard/accountant";
import { POSQuickAccessCard } from "@/components/pos";
import { LastSyncIndicator } from "@/components/nazer/LastSyncIndicator";
import { useAccountantDashboardRealtime, useAccountantDashboardRefresh } from "@/hooks/dashboard/useAccountantDashboardRealtime";

// Lazy load components
const AccountingStats = lazy(() => import("@/components/dashboard/AccountingStats"));
const RecentJournalEntries = lazy(() => import("@/components/dashboard/RecentJournalEntries"));

const AccountantDashboard = () => {
  const [selectedApproval, setSelectedApproval] = useState<JournalApproval | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  
  // تفعيل التحديثات المباشرة الموحدة
  useAccountantDashboardRealtime();
  const { refreshAll } = useAccountantDashboardRefresh();
  
  const { data: kpis, isLoading: kpisLoading } = useAccountantKPIs();
  const { pendingApprovals, isLoading: approvalsLoading } = useAccountantDashboardData();

  const handleReviewApproval = (approval: JournalApproval) => {
    setSelectedApproval(approval);
    setIsApprovalDialogOpen(true);
  };

  return (
    <UnifiedDashboardLayout
      role="accountant"
      actions={
        <div className="flex items-center gap-2">
          <LastSyncIndicator onRefresh={refreshAll} />
          <Button onClick={refreshAll} variant="ghost" size="icon" title="تحديث البيانات">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setMessageDialogOpen(true)} className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">إرسال رسالة</span>
          </Button>
        </div>
      }
    >
      {/* Statistics Cards */}
      {kpisLoading ? (
        <SectionSkeleton />
      ) : (
        <UnifiedStatsGrid columns={4}>
          <UnifiedKPICard
            title="موافقات معلقة"
            value={kpis?.pendingApprovals || 0}
            icon={AlertCircle}
            variant="warning"
            subtitle="تحتاج مراجعة"
          />
          <UnifiedKPICard
            title="قيود مسودة"
            value={kpis?.draftEntries || 0}
            icon={FileClock}
            variant="default"
            subtitle="غير مرحّلة"
          />
          <UnifiedKPICard
            title="قيود مرحّلة"
            value={kpis?.postedEntries || 0}
            icon={FileCheck}
            variant="success"
            subtitle="معتمدة ومرحّلة"
          />
          <UnifiedKPICard
            title="قيود اليوم"
            value={kpis?.todayEntries || 0}
            icon={TrendingUp}
            variant="default"
            subtitle="قيود جديدة اليوم"
          />
        </UnifiedStatsGrid>
      )}

      {/* السنة المالية وتقدم الإيرادات */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 mt-4">
        <CurrentFiscalYearCard />
        <RevenueProgressCard />
      </div>

      {/* بطاقات الرصيد البنكي ورقبة الوقف ونقطة البيع */}
      <FinancialCardsRow className="mt-4" />

      {/* Tabs for organized view */}
      <Tabs defaultValue="overview" className="space-y-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="inline-flex h-auto p-1 bg-muted/50">
            <TabsTrigger 
              value="overview" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 sm:px-4"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-xs sm:text-sm">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger 
              value="approvals"
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 sm:px-4"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs sm:text-sm">الموافقات</span>
            </TabsTrigger>
            <TabsTrigger 
              value="entries"
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 sm:px-4"
            >
              <FileText className="h-4 w-4" />
              <span className="text-xs sm:text-sm">القيود الأخيرة</span>
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<SectionSkeleton />}>
            <AccountingStats />
          </Suspense>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                الموافقات المعلقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvalsLoading ? (
                <SectionSkeleton />
              ) : (
                <PendingApprovalsList 
                  approvals={pendingApprovals} 
                  onReview={handleReviewApproval} 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                آخر القيود المحاسبية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SectionSkeleton />}>
                <RecentJournalEntries />
              </Suspense>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActionsGrid />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      {selectedApproval && (
        <ApproveJournalDialog
          open={isApprovalDialogOpen}
          onOpenChange={setIsApprovalDialogOpen}
          approval={selectedApproval}
        />
      )}

      {/* Message Dialog */}
      <AdminSendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
      />
    </UnifiedDashboardLayout>
  );
};

export default AccountantDashboard;
