import { Shield, LayoutDashboard, Users, Lock, Activity, Settings, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';
import { Button } from "@/components/ui/button";
import { AdminSendMessageDialog } from "@/components/messages/AdminSendMessageDialog";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { SystemHealthMonitor } from "@/components/dashboard/admin/SystemHealthMonitor";
import { UserManagementSection } from "@/components/dashboard/admin/UserManagementSection";
import { SecurityAlertsSection } from "@/components/dashboard/admin/SecurityAlertsSection";
import { AuditLogsPreview } from "@/components/dashboard/admin/AuditLogsPreview";
import { SystemPerformanceChart } from "@/components/dashboard/admin/SystemPerformanceChart";
import { UsersActivityChart } from "@/components/dashboard/admin/UsersActivityChart";
import { useAdminKPIs } from "@/hooks/useAdminKPIs";
import { Users as UsersIcon, Building2, Wallet, FileText } from "lucide-react";
import { LazyTabContent } from "@/components/dashboard/admin/LazyTabContent";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";

const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
);

const SectionSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
    </CardHeader>
    <CardContent className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

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
    <PageErrorBoundary pageName="لوحة تحكم المشرف">
      <MobileOptimizedLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <MobileOptimizedHeader
              title="لوحة تحكم المشرف"
              description="إدارة شاملة للنظام والمستخدمين"
              icon={<Shield className="h-8 w-8 text-primary" />}
            />
            <Button onClick={() => setMessageDialogOpen(true)} className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">إرسال رسالة</span>
            </Button>
          </div>

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
                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات النظام</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      قريباً: إعدادات متقدمة للنظام
                    </p>
                  </CardContent>
                </Card>
              </LazyTabContent>
            </TabsContent>
          </Tabs>
        </div>

        <AdminSendMessageDialog
          open={messageDialogOpen}
          onOpenChange={setMessageDialogOpen}
        />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
