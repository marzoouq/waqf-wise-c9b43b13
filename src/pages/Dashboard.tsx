import { lazy, Suspense, useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Bell } from "lucide-react";
import { ChatbotQuickCard } from "@/components/dashboard/ChatbotQuickCard";
import BeneficiaryDialog from "@/components/beneficiaries/BeneficiaryDialog";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { DistributionDialog } from "@/components/funds/DistributionDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[...Array(8)].map((_, i) => (
      <Card key={i} className="shadow-soft">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <Card className="shadow-soft">
    <CardHeader>
      <Skeleton className="h-6 w-40" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[300px] w-full" />
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { isBeneficiary, isAccountant, isNazer, isCashier, isArchivist, isLoading: roleLoading } = useUserRole();
  
  const [isBeneficiaryDialogOpen, setIsBeneficiaryDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isDistributionDialogOpen, setIsDistributionDialogOpen] = useState(false);

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
      <div className="container mx-auto py-8 px-4">
        <KPISkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          لوحة تحكم المشرف
        </h1>
        <p className="text-muted-foreground">
          نظرة شاملة على جميع عمليات الوقف
        </p>
      </div>

      {/* Chatbot Quick Access Card */}
      <div className="mb-8">
        <Suspense fallback={<ChartSkeleton />}>
          <ChatbotQuickCard />
        </Suspense>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 h-auto p-1 bg-muted/50">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-3"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">نظرة عامة</span>
          </TabsTrigger>
          <TabsTrigger 
            value="financial" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-3"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">المالية</span>
          </TabsTrigger>
          <TabsTrigger 
            value="beneficiaries" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-3"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">المستفيدون</span>
          </TabsTrigger>
          <TabsTrigger 
            value="activities" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-3"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">النشاطات</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8 animate-fade-in">
          <Suspense fallback={<KPISkeleton />}>
            <AdminKPIs />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Suspense fallback={<ChartSkeleton />}>
              <RevenueExpenseChart />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <AccountDistributionChart />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        <TabsContent value="financial" className="space-y-8 animate-fade-in">
          <Suspense fallback={<KPISkeleton />}>
            <FinancialStats />
          </Suspense>

          <Suspense fallback={<KPISkeleton />}>
            <AccountingStats />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        <TabsContent value="beneficiaries" className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        <TabsContent value="activities" className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
    </div>
  );
};

export default Dashboard;
