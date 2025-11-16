import { Shield, LayoutDashboard, TrendingUp, Building2, Bell, Vote } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';
import PendingApprovalsSection from "@/components/dashboard/nazer/PendingApprovalsSection";
import NazerKPIs from "@/components/dashboard/nazer/NazerKPIs";
import SmartAlertsSection from "@/components/dashboard/nazer/SmartAlertsSection";
import QuickActionsGrid from "@/components/dashboard/nazer/QuickActionsGrid";
import RevenueDistributionChart from "@/components/dashboard/nazer/RevenueDistributionChart";
import PropertiesPerformanceChart from "@/components/dashboard/nazer/PropertiesPerformanceChart";
import RevenueExpenseChart from "@/components/dashboard/RevenueExpenseChart";
import BudgetComparisonChart from "@/components/dashboard/BudgetComparisonChart";
import { AIInsightsWidget } from "@/components/dashboard/AIInsightsWidget";
import { GovernanceSection } from "@/components/governance/GovernanceSection";

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

export default function NazerDashboard() {
  return (
    <MobileOptimizedLayout>
      <div className="space-y-6">
        <MobileOptimizedHeader
          title="لوحة تحكم الناظر"
          description="نظرة شاملة على جميع عمليات الوقف"
          icon={<Shield className="h-8 w-8 text-primary" />}
        />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid h-auto p-1 bg-muted/50">
            <TabsTrigger 
              value="overview" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger 
              value="governance" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Vote className="h-4 w-4" />
              <span className="hidden sm:inline">الحوكمة</span>
            </TabsTrigger>
            <TabsTrigger 
              value="financial" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">المالية</span>
            </TabsTrigger>
            <TabsTrigger 
              value="properties" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">العقارات</span>
            </TabsTrigger>
            <TabsTrigger 
              value="alerts" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">التنبيهات</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Suspense fallback={<SectionSkeleton />}>
              <NazerKPIs />
            </Suspense>

            <div className="grid gap-6 lg:grid-cols-2">
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

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6 mt-6">
            <Suspense fallback={<SectionSkeleton />}>
              <GovernanceSection />
            </Suspense>

            <div className="grid gap-6 lg:grid-cols-2">
              <Suspense fallback={<ChartSkeleton />}>
                <PendingApprovalsSection />
              </Suspense>
              <Suspense fallback={<ChartSkeleton />}>
                <SmartAlertsSection />
              </Suspense>
            </div>

            <Suspense fallback={<ChartSkeleton />}>
              <QuickActionsGrid />
            </Suspense>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
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

            <Suspense fallback={<ChartSkeleton />}>
              <AIInsightsWidget />
            </Suspense>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6 mt-6">
            <Suspense fallback={<ChartSkeleton />}>
              <PropertiesPerformanceChart />
            </Suspense>

            <Suspense fallback={<ChartSkeleton />}>
              <SmartAlertsSection />
            </Suspense>

            <Suspense fallback={<ChartSkeleton />}>
              <QuickActionsGrid />
            </Suspense>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6 mt-6">
            <Suspense fallback={<SectionSkeleton />}>
              <PendingApprovalsSection />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
              <SmartAlertsSection />
            </Suspense>

            <Suspense fallback={<ChartSkeleton />}>
              <AIInsightsWidget />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </MobileOptimizedLayout>
  );
}
