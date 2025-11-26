import { LayoutDashboard, Users, Lock, Activity, Settings, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminSendMessageDialog } from "@/components/messages/AdminSendMessageDialog";
import { SystemHealthMonitor } from "@/components/dashboard/admin/SystemHealthMonitor";
import { UserManagementSection } from "@/components/dashboard/admin/UserManagementSection";
import { SecurityAlertsSection } from "@/components/dashboard/admin/SecurityAlertsSection";
import { AuditLogsPreview } from "@/components/dashboard/admin/AuditLogsPreview";
import { SystemPerformanceChart } from "@/components/dashboard/admin/SystemPerformanceChart";
import { UsersActivityChart } from "@/components/dashboard/admin/UsersActivityChart";
import { AdminSettingsSection } from "@/components/dashboard/admin/AdminSettingsSection";
import { useAdminKPIs } from "@/hooks/useAdminKPIs";
import { Users as UsersIcon, Building2, Wallet, FileText } from "lucide-react";
import { LazyTabContent } from "@/components/dashboard/admin/LazyTabContent";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedDashboardLayout } from "@/components/dashboard/UnifiedDashboardLayout";
import { ChartSkeleton, SectionSkeleton } from "@/components/dashboard";

function AdminKPIsSection() {
  const { data: kpis, isLoading } = useAdminKPIs();

  if (isLoading) {
    return (
      <UnifiedStatsGrid columns={4}>
        {[...Array(4)].map((_, i) => (
          <UnifiedKPICard
            key={i}
            title="جاري التحميل..."
            value="..."
            icon={UsersIcon}
            loading={true}
          />
        ))}
      </UnifiedStatsGrid>
    );
  }

  if (!kpis) return null;

  const stats = [
    {
      title: "إجمالي المستفيدين",
      value: kpis.totalBeneficiaries,
      subtitle: `${kpis.activeBeneficiaries} نشط`,
      icon: UsersIcon,
      variant: "default" as const,
    },
    {
      title: "العقارات",
      value: kpis.totalProperties,
      subtitle: `${kpis.occupiedProperties} مؤجر`,
      icon: Building2,
      variant: "success" as const,
    },
    {
      title: "الأموال",
      value: kpis.totalFunds,
      subtitle: `${kpis.activeFunds} نشط`,
      icon: Wallet,
      variant: "default" as const,
    },
    {
      title: "الطلبات المعلقة",
      value: kpis.pendingRequests,
      subtitle: `${kpis.overdueRequests} متأخر`,
      icon: FileText,
      variant: "warning" as const,
    },
  ];

  return (
    <UnifiedStatsGrid columns={4}>
      {stats.map((stat, index) => (
        <UnifiedKPICard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          variant={stat.variant}
          subtitle={stat.subtitle}
        />
      ))}
    </UnifiedStatsGrid>
  );
}

export default function AdminDashboard() {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("system");

  return (
    <UnifiedDashboardLayout
      role="admin"
      actions={
        <Button onClick={() => setMessageDialogOpen(true)} className="gap-2">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">إرسال رسالة</span>
        </Button>
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
              <Suspense fallback={<SectionSkeleton />}>
                <AdminKPIsSection />
              </Suspense>

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
