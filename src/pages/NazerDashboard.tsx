import { Shield, LayoutDashboard, TrendingUp, Building2, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';

// Lazy load heavy components
const PendingApprovalsSection = lazy(() => import("@/components/dashboard/nazer/PendingApprovalsSection"));
const NazerKPIs = lazy(() => import("@/components/dashboard/nazer/NazerKPIs"));
const SmartAlertsSection = lazy(() => import("@/components/dashboard/nazer/SmartAlertsSection"));
const QuickActionsGrid = lazy(() => import("@/components/dashboard/nazer/QuickActionsGrid"));
const RevenueDistributionChart = lazy(() => import("@/components/dashboard/nazer/RevenueDistributionChart"));
const PropertiesPerformanceChart = lazy(() => import("@/components/dashboard/nazer/PropertiesPerformanceChart"));
const RevenueExpenseChart = lazy(() => import("@/components/dashboard/RevenueExpenseChart"));
const BudgetComparisonChart = lazy(() => import("@/components/dashboard/BudgetComparisonChart"));
const AIInsightsWidget = lazy(() => import("@/components/dashboard/AIInsightsWidget").then(module => ({ default: module.AIInsightsWidget })));

const ChartSkeleton = () => (
  <Card className="p-6">
    <Skeleton className="h-64 w-full" />
  </Card>
);

const KPISkeleton = () => (
  <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-2 lg:grid-cols-4 mb-6">
    {[...Array(8)].map((_, i) => (
      <Card key={i} className="p-4">
        <Skeleton className="h-20 w-full" />
      </Card>
    ))}
  </div>
);

export default function NazerDashboard() {
  return (
    <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="لوحة تحكم الناظر"
        description="نظرة شاملة وتحكم كامل في جميع عمليات الوقف"
        icon={<Shield className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />}
      />

      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2">
          <TabsTrigger value="overview" className="gap-2 py-3">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">نظرة عامة</span>
            <span className="sm:hidden">عامة</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2 py-3">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">الشؤون المالية</span>
            <span className="sm:hidden">مالية</span>
          </TabsTrigger>
          <TabsTrigger value="properties" className="gap-2 py-3">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">إدارة العقارات</span>
            <span className="sm:hidden">عقارات</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2 py-3">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">التنبيهات والموافقات</span>
            <span className="sm:hidden">تنبيهات</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          <Suspense fallback={<KPISkeleton />}>
            <NazerKPIs />
          </Suspense>

          <div className="grid gap-4 lg:grid-cols-2">
            <Suspense fallback={<ChartSkeleton />}>
              <RevenueDistributionChart />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <RevenueExpenseChart />
            </Suspense>
          </div>

          <Suspense fallback={<ChartSkeleton />}>
            <AIInsightsWidget />
          </Suspense>

          <Suspense fallback={<ChartSkeleton />}>
            <QuickActionsGrid />
          </Suspense>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6 animate-fade-in">
          <Suspense fallback={<KPISkeleton />}>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">إجمالي الأصول</div>
                <div className="text-2xl font-bold">عرض مباشر</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">إجمالي الإيرادات</div>
                <div className="text-2xl font-bold">عرض مباشر</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">الميزانية المتاحة</div>
                <div className="text-2xl font-bold">عرض مباشر</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">العائد الشهري</div>
                <div className="text-2xl font-bold">عرض مباشر</div>
              </Card>
            </div>
          </Suspense>

          <div className="grid gap-4 lg:grid-cols-2">
            <Suspense fallback={<ChartSkeleton />}>
              <RevenueDistributionChart />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <BudgetComparisonChart />
            </Suspense>
          </div>

          <Suspense fallback={<ChartSkeleton />}>
            <RevenueExpenseChart />
          </Suspense>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-6 animate-fade-in">
          <Suspense fallback={<KPISkeleton />}>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">العقارات النشطة</div>
                <div className="text-2xl font-bold">عرض مباشر</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">العقارات المؤجرة</div>
                <div className="text-2xl font-bold">عرض مباشر</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">الإيجارات الشهرية</div>
                <div className="text-2xl font-bold">عرض مباشر</div>
              </Card>
            </div>
          </Suspense>

          <Suspense fallback={<ChartSkeleton />}>
            <PropertiesPerformanceChart />
          </Suspense>

          <Suspense fallback={<ChartSkeleton />}>
            <QuickActionsGrid />
          </Suspense>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6 animate-fade-in">
          <Suspense fallback={<ChartSkeleton />}>
            <PendingApprovalsSection />
          </Suspense>

          <Suspense fallback={<ChartSkeleton />}>
            <SmartAlertsSection />
          </Suspense>

          <Suspense fallback={<ChartSkeleton />}>
            <AIInsightsWidget />
          </Suspense>
        </TabsContent>
      </Tabs>
    </MobileOptimizedLayout>
  );
}
