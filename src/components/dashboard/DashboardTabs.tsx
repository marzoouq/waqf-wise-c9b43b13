import { lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Bell } from "lucide-react";
import { ChatbotQuickCard } from "@/components/dashboard/ChatbotQuickCard";
import { ChartSkeleton } from "@/components/dashboard";
import { KPISkeleton } from "@/components/dashboard/KPISkeleton";

// Import critical components directly for better FCP/LCP
import { AdminKPIs } from "@/components/dashboard/admin/AdminKPIs";
import RevenueExpenseChart from "@/components/dashboard/RevenueExpenseChart";

// Lazy load non-critical components
const AdminActivities = lazy(() => import("@/components/dashboard/admin/AdminActivities").then(m => ({ default: m.AdminActivities })));
const AdminTasks = lazy(() => import("@/components/dashboard/admin/AdminTasks").then(m => ({ default: m.AdminTasks })));
const QuickActions = lazy(() => import("@/components/dashboard/admin/QuickActions").then(m => ({ default: m.QuickActions })));
const FinancialStats = lazy(() => import("@/components/dashboard/FinancialStats"));
const FamiliesStats = lazy(() => import("@/components/dashboard/FamiliesStats"));
const IntegratedReportsWidget = lazy(() => import("@/components/dashboard/IntegratedReportsWidget").then(m => ({ default: m.IntegratedReportsWidget })));
const RequestsStats = lazy(() => import("@/components/dashboard/RequestsStats"));
const AccountingStats = lazy(() => import("@/components/dashboard/AccountingStats"));
const AccountDistributionChart = lazy(() => import("@/components/dashboard/AccountDistributionChart"));
const BudgetComparisonChart = lazy(() => import("@/components/dashboard/BudgetComparisonChart"));
const RecentJournalEntries = lazy(() => import("@/components/dashboard/RecentJournalEntries"));
const VouchersStatsCard = lazy(() => import("@/components/dashboard/VouchersStatsCard").then(m => ({ default: m.VouchersStatsCard })));
const PropertyStatsCard = lazy(() => import("@/components/dashboard/PropertyStatsCard").then(m => ({ default: m.PropertyStatsCard })));
const ExpiringContractsCard = lazy(() => import("@/components/dashboard/ExpiringContractsCard").then(m => ({ default: m.ExpiringContractsCard })));

interface DashboardTabsProps {
  onOpenBeneficiaryDialog: () => void;
  onOpenPropertyDialog: () => void;
  onOpenDistributionDialog: () => void;
}

export function DashboardTabs({
  onOpenBeneficiaryDialog,
  onOpenPropertyDialog,
  onOpenDistributionDialog,
}: DashboardTabsProps) {
  return (
    <>
      {/* Chatbot Quick Access */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <Suspense fallback={<ChartSkeleton />}>
          <ChatbotQuickCard />
        </Suspense>
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-4 sm:space-y-5 md:space-y-6">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>نظرة عامة</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>المالية</span>
          </TabsTrigger>
          <TabsTrigger value="beneficiaries" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>المستفيدون</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>النشاطات</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Critical content loaded immediately */}
          <AdminKPIs />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <RevenueExpenseChart />
            <Suspense fallback={<ChartSkeleton />}>
              <AccountDistributionChart />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <Suspense fallback={<ChartSkeleton />}>
              <AdminActivities />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <AdminTasks />
            </Suspense>
          </div>

          <Suspense fallback={<ChartSkeleton />}>
            <PropertyStatsCard />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <Suspense fallback={<ChartSkeleton />}>
              <ExpiringContractsCard />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <IntegratedReportsWidget />
            </Suspense>
          </div>

          <Suspense fallback={<ChartSkeleton />}>
            <QuickActions
              onOpenBeneficiaryDialog={onOpenBeneficiaryDialog}
              onOpenPropertyDialog={onOpenPropertyDialog}
              onOpenDistributionDialog={onOpenDistributionDialog}
            />
          </Suspense>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4 sm:space-y-5 md:space-y-6">
          <Suspense fallback={<KPISkeleton />}>
            <FinancialStats />
          </Suspense>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <Suspense fallback={<KPISkeleton />}>
              <AccountingStats />
            </Suspense>
            <Suspense fallback={<KPISkeleton />}>
              <VouchersStatsCard />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <Suspense fallback={<ChartSkeleton />}>
              <RevenueExpenseChart />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <BudgetComparisonChart />
            </Suspense>
          </div>

          <Suspense fallback={<ChartSkeleton />}>
            <RecentJournalEntries />
          </Suspense>
        </TabsContent>

        {/* Beneficiaries Tab */}
        <TabsContent value="beneficiaries" className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <Suspense fallback={<ChartSkeleton />}>
              <FamiliesStats />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <RequestsStats />
            </Suspense>
          </div>

          <Suspense fallback={<ChartSkeleton />}>
            <QuickActions
              onOpenBeneficiaryDialog={onOpenBeneficiaryDialog}
              onOpenPropertyDialog={onOpenPropertyDialog}
              onOpenDistributionDialog={onOpenDistributionDialog}
            />
          </Suspense>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <Suspense fallback={<ChartSkeleton />}>
              <AdminActivities />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <AdminTasks />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
