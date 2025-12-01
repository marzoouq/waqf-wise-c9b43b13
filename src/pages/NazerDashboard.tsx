import { Shield, LayoutDashboard, TrendingUp, Building2, Bell, Vote, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Suspense, useState } from "react";
import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';
import { Button } from "@/components/ui/button";
import { AdminSendMessageDialog } from "@/components/messages/AdminSendMessageDialog";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { ChartSkeleton, SectionSkeleton } from "@/components/dashboard";
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

export default function NazerDashboard() {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  return (
    <PageErrorBoundary pageName="لوحة تحكم الناظر">
      <MobileOptimizedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <MobileOptimizedHeader
            title="لوحة تحكم الناظر"
            description="نظرة شاملة على جميع عمليات الوقف"
            icon={<Shield className="h-8 w-8 text-primary" />}
          />
          <Button onClick={() => setMessageDialogOpen(true)} className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">إرسال رسالة</span>
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
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
                value="governance" 
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 sm:px-4"
              >
                <Vote className="h-4 w-4" />
                <span className="text-xs sm:text-sm">الحوكمة</span>
              </TabsTrigger>
              <TabsTrigger 
                value="financial" 
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 sm:px-4"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs sm:text-sm">المالية</span>
              </TabsTrigger>
              <TabsTrigger 
                value="properties" 
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 sm:px-4"
              >
                <Building2 className="h-4 w-4" />
                <span className="text-xs sm:text-sm">العقارات</span>
              </TabsTrigger>
              <TabsTrigger 
                value="alerts" 
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 sm:px-4"
              >
                <Bell className="h-4 w-4" />
                <span className="text-xs sm:text-sm">التنبيهات</span>
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

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

      <AdminSendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
      />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
