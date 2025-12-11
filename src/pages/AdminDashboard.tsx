import { LayoutDashboard, Users, Lock, Activity, Settings, Mail, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminSendMessageDialog } from "@/components/messages/AdminSendMessageDialog";
import { SystemHealthMonitor } from "@/components/dashboard/admin/SystemHealthMonitor";
import { UserManagementSection } from "@/components/dashboard/admin/UserManagementSection";
import { SecurityAlertsSection } from "@/components/dashboard/admin/SecurityAlertsSection";
import { AuditLogsPreview } from "@/components/dashboard/admin/AuditLogsPreview";
import { SystemPerformanceChart } from "@/components/dashboard/admin/SystemPerformanceChart";
import { UsersActivityChart } from "@/components/dashboard/admin/UsersActivityChart";
import { AdminSettingsSection } from "@/components/dashboard/admin/AdminSettingsSection";
import { AdminKPIs } from "@/components/dashboard/admin/AdminKPIs";
import { LazyTabContent } from "@/components/dashboard/admin/LazyTabContent";
import { UnifiedDashboardLayout } from "@/components/dashboard/UnifiedDashboardLayout";
import { ChartSkeleton, SectionSkeleton } from "@/components/dashboard";
import { BankBalanceCard } from "@/components/shared/BankBalanceCard";
import { WaqfCorpusCard } from "@/components/shared/WaqfCorpusCard";
import { CurrentFiscalYearCard, RevenueProgressCard, FinancialCardsRow } from "@/components/dashboard/shared";
import { POSQuickAccessCard } from "@/components/pos";
import { LastSyncIndicator } from "@/components/nazer/LastSyncIndicator";
import { useAdminDashboardRealtime, useAdminDashboardRefresh } from "@/hooks/dashboard/useAdminDashboardRealtime";

export default function AdminDashboard() {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("system");
  
  // تفعيل التحديثات المباشرة الموحدة
  useAdminDashboardRealtime();
  const { refreshAll } = useAdminDashboardRefresh();

  const handleRefresh = () => {
    refreshAll();
  };

  return (
    <UnifiedDashboardLayout
      role="admin"
      actions={
        <div className="flex items-center gap-2">
          <LastSyncIndicator onRefresh={handleRefresh} />
          <Button onClick={handleRefresh} variant="ghost" size="icon" title="تحديث البيانات">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setMessageDialogOpen(true)} className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">إرسال رسالة</span>
          </Button>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid h-auto p-1 bg-muted/50">
          <TabsTrigger 
            value="system" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">النظام</span>
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">المستخدمون</span>
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">الأمان</span>
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">الأداء</span>
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">الإعدادات</span>
          </TabsTrigger>
        </TabsList>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6 mt-6">
          {/* السنة المالية وتقدم الإيرادات */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CurrentFiscalYearCard />
            <RevenueProgressCard />
          </div>

          <Suspense fallback={<SectionSkeleton />}>
            <AdminKPIs />
          </Suspense>

          {/* بطاقات الرصيد البنكي ورقبة الوقف ونقطة البيع */}
          <FinancialCardsRow />

          <div className="grid gap-6 lg:grid-cols-2">
            <Suspense fallback={<ChartSkeleton />}>
              <SystemHealthMonitor />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <SecurityAlertsSection />
            </Suspense>
          </div>

          <Suspense fallback={<ChartSkeleton />}>
            <AuditLogsPreview />
          </Suspense>
        </TabsContent>

        {/* Users Tab - Lazy Load */}
        <TabsContent value="users" className="space-y-6 mt-6">
          <LazyTabContent isActive={activeTab === "users"}>
            <Suspense fallback={<ChartSkeleton />}>
              <UserManagementSection />
            </Suspense>

            <Suspense fallback={<ChartSkeleton />}>
              <UsersActivityChart />
            </Suspense>

            <Suspense fallback={<ChartSkeleton />}>
              <AuditLogsPreview />
            </Suspense>
          </LazyTabContent>
        </TabsContent>

        {/* Security Tab - Lazy Load */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <LazyTabContent isActive={activeTab === "security"}>
            <Suspense fallback={<ChartSkeleton />}>
              <SecurityAlertsSection />
            </Suspense>

            <Suspense fallback={<ChartSkeleton />}>
              <AuditLogsPreview />
            </Suspense>
          </LazyTabContent>
        </TabsContent>

        {/* Performance Tab - Lazy Load */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          <LazyTabContent isActive={activeTab === "performance"}>
            <Suspense fallback={<ChartSkeleton />}>
              <SystemPerformanceChart />
            </Suspense>

            <div className="grid gap-6 lg:grid-cols-2">
              <Suspense fallback={<ChartSkeleton />}>
                <SystemHealthMonitor />
              </Suspense>
              <Suspense fallback={<ChartSkeleton />}>
                <UsersActivityChart />
              </Suspense>
            </div>
          </LazyTabContent>
        </TabsContent>

        {/* Settings Tab - Lazy Load */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <LazyTabContent isActive={activeTab === "settings"}>
            <Suspense fallback={<ChartSkeleton />}>
              <AdminSettingsSection />
            </Suspense>
          </LazyTabContent>
        </TabsContent>
      </Tabs>

      <AdminSendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
      />
    </UnifiedDashboardLayout>
  );
}
