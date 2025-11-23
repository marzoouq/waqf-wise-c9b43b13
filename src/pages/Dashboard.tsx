import { lazy, Suspense, useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Bell, Mail } from "lucide-react";
import { ChatbotQuickCard } from "@/components/dashboard/ChatbotQuickCard";
import { Button } from "@/components/ui/button";
import { AdminSendMessageDialog } from "@/components/messages/AdminSendMessageDialog";
import BeneficiaryDialog from "@/components/beneficiaries/BeneficiaryDialog";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { DistributionDialog } from "@/components/funds/DistributionDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";

// Lazy load heavy components
const AdminKPIs = lazy(() => import("@/components/dashboard/admin/AdminKPIs").then(m => ({ default: m.AdminKPIs })));
const AdminActivities = lazy(() => import("@/components/dashboard/admin/AdminActivities").then(m => ({ default: m.AdminActivities })));
const AdminTasks = lazy(() => import("@/components/dashboard/admin/AdminTasks").then(m => ({ default: m.AdminTasks })));
const QuickActions = lazy(() => import("@/components/dashboard/admin/QuickActions").then(m => ({ default: m.QuickActions })));
const FinancialStats = lazy(() => import("@/components/dashboard/FinancialStats"));
const FamiliesStats = lazy(() => import("@/components/dashboard/FamiliesStats"));
const RequestsStats = lazy(() => import("@/components/dashboard/RequestsStats"));
const AccountingStats = lazy(() => import("@/components/dashboard/AccountingStats"));
const RevenueExpenseChart = lazy(() => import("@/components/dashboard/RevenueExpenseChart"));
const AccountDistributionChart = lazy(() => import("@/components/dashboard/AccountDistributionChart"));
const BudgetComparisonChart = lazy(() => import("@/components/dashboard/BudgetComparisonChart"));
const RecentJournalEntries = lazy(() => import("@/components/dashboard/RecentJournalEntries"));

// Skeleton components
const KPISkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
    {[...Array(8)].map((_, i) => (
      <Card key={i} className="shadow-soft">
        <CardHeader className="pb-2 sm:pb-3">
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 mb-1 sm:mb-2" />
          <Skeleton className="h-2 sm:h-3 w-16 sm:w-20" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <Card className="shadow-soft">
    <CardHeader className="pb-2 sm:pb-4">
      <Skeleton className="h-4 sm:h-6 w-32 sm:w-40" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[200px] sm:h-[250px] md:h-[300px] w-full" />
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { isBeneficiary, isAccountant, isNazer, isCashier, isArchivist, isLoading: roleLoading } = useUserRole();
  
  const [isBeneficiaryDialogOpen, setIsBeneficiaryDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isDistributionDialogOpen, setIsDistributionDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  // Role-based routing
  useEffect(() => {
    if (isBeneficiary) {
      navigate("/beneficiary-dashboard", { replace: true });
    } else if (isAccountant) {
      navigate("/accountant-dashboard", { replace: true });
    } else if (isNazer) {
      navigate("/nazer-dashboard", { replace: true });
    } else if (isCashier) {
      navigate("/cashier-dashboard", { replace: true });
    } else if (isArchivist) {
      navigate("/archivist-dashboard", { replace: true });
    }
  }, [isBeneficiary, isAccountant, isNazer, isCashier, isArchivist, navigate]);

  if (roleLoading) {
    return (
      <MobileOptimizedLayout>
        <KPISkeleton />
      </MobileOptimizedLayout>
    );
  }

  return (
    <PageErrorBoundary pageName="لوحة التحكم">
      <MobileOptimizedLayout>
      <div className="flex items-center justify-between mb-4">
        <MobileOptimizedHeader
          title="لوحة تحكم المشرف"
          description="نظرة شاملة على جميع عمليات الوقف"
          icon={<BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />
        <Button onClick={() => setMessageDialogOpen(true)} className="gap-2">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">إرسال رسالة</span>
        </Button>
      </div>

      {/* Chatbot Quick Access Card */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <Suspense fallback={<ChartSkeleton />}>
          <ChatbotQuickCard />
        </Suspense>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full space-y-4 sm:space-y-5 md:space-y-6">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 bg-muted/50 p-1">
          <TabsTrigger 
            value="overview" 
            className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>نظرة عامة</span>
          </TabsTrigger>
          <TabsTrigger 
            value="financial" 
            className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>المالية</span>
          </TabsTrigger>
          <TabsTrigger 
            value="beneficiaries" 
            className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>المستفيدون</span>
          </TabsTrigger>
          <TabsTrigger 
            value="activities" 
            className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>النشاطات</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-5 md:space-y-6">
          <Suspense fallback={<KPISkeleton />}>
            <AdminKPIs />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <Suspense fallback={<ChartSkeleton />}>
              <RevenueExpenseChart />
            </Suspense>
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
            <QuickActions
              onOpenBeneficiaryDialog={() => setIsBeneficiaryDialogOpen(true)}
              onOpenPropertyDialog={() => setIsPropertyDialogOpen(true)}
              onOpenDistributionDialog={() => setIsDistributionDialogOpen(true)}
            />
          </Suspense>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4 sm:space-y-5 md:space-y-6">
          <Suspense fallback={<KPISkeleton />}>
            <FinancialStats />
          </Suspense>

          <Suspense fallback={<KPISkeleton />}>
            <AccountingStats />
          </Suspense>

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
              onOpenBeneficiaryDialog={() => setIsBeneficiaryDialogOpen(true)}
              onOpenPropertyDialog={() => setIsPropertyDialogOpen(true)}
              onOpenDistributionDialog={() => setIsDistributionDialogOpen(true)}
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

      {/* Dialogs */}
      <BeneficiaryDialog
        open={isBeneficiaryDialogOpen}
        onOpenChange={setIsBeneficiaryDialogOpen}
        onSave={() => setIsBeneficiaryDialogOpen(false)}
      />
      <PropertyDialog
        open={isPropertyDialogOpen}
        onOpenChange={setIsPropertyDialogOpen}
        onSave={() => setIsPropertyDialogOpen(false)}
      />
      <DistributionDialog
        open={isDistributionDialogOpen}
        onOpenChange={setIsDistributionDialogOpen}
        onDistribute={() => setIsDistributionDialogOpen(false)}
      />
      <AdminSendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
      />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Dashboard;
