import { useState, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, DollarSign, AlertCircle, CheckCircle, XCircle, TrendingUp, FileCheck, FileClock } from "lucide-react";
import { useAccountantKPIs } from "@/hooks/useAccountantKPIs";
import { ApproveJournalDialog } from "@/components/accounting/ApproveJournalDialog";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";

// Lazy load components
const AccountingStats = lazy(() => import("@/components/dashboard/AccountingStats"));
const RecentJournalEntries = lazy(() => import("@/components/dashboard/RecentJournalEntries"));

// Skeleton loaders
const StatsSkeleton = () => (
  <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
          <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 sm:h-7 md:h-8 w-16 sm:w-20 mb-1 sm:mb-2" />
          <Skeleton className="h-2 sm:h-3 w-24 sm:w-32" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-2 sm:space-y-3">
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-16 sm:h-20 w-full" />
    ))}
  </div>
);

interface JournalApproval {
  id: string;
  journal_entry_id: string;
  approver_name: string;
  status: string;
  notes: string | null;
  created_at: string;
  approved_at: string | null;
  updated_at: string;
  journal_entry: {
    id: string;
    entry_number: string;
    entry_date: string;
    description: string;
    status: string;
    reference_type: string;
    reference_id: string;
    fiscal_year_id: string;
    posted_at: string | null;
    created_at: string;
    created_by: string | null;
    updated_at: string;
  };
}

const AccountantDashboard = () => {
  const [selectedApproval, setSelectedApproval] = useState<JournalApproval | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  
  const { data: kpis, isLoading: kpisLoading } = useAccountantKPIs();

  // Fetch pending approvals
  const { data: pendingApprovals = [], isLoading: approvalsLoading } = useQuery({
    queryKey: ["pending_approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approvals")
        .select(`
          *,
          journal_entry:journal_entries(*)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
    type IconComponent = React.ComponentType<{ className?: string }>;
    const variants: Record<string, { label: string; variant: BadgeVariant; icon: IconComponent }> = {
      pending: { label: "قيد المراجعة", variant: "secondary", icon: AlertCircle },
      approved: { label: "موافق عليه", variant: "default", icon: CheckCircle },
      rejected: { label: "مرفوض", variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || { label: status, variant: "outline" as BadgeVariant, icon: FileText };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <PageErrorBoundary pageName="لوحة تحكم المحاسب">
      <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="لوحة تحكم المحاسب"
        description="إدارة القيود المحاسبية والموافقات المالية"
        icon={<DollarSign className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-emerald-600" />}
      />

      {/* Statistics Cards */}
      {kpisLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-amber-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">موافقات معلقة</CardTitle>
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-amber-600">
                  {kpis?.pendingApprovals || 0}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">تحتاج مراجعة</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-info">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">قيود مسودة</CardTitle>
                <FileClock className="h-3 w-3 sm:h-4 sm:w-4 text-info group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-info">
                  {kpis?.draftEntries || 0}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">غير مرحّلة</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-success">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">قيود مرحّلة</CardTitle>
                <FileCheck className="h-3 w-3 sm:h-4 sm:w-4 text-success group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-success">
                  {kpis?.postedEntries || 0}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">معتمدة ومرحّلة</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-accent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">قيود اليوم</CardTitle>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-accent group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-accent">
                  {kpis?.todayEntries || 0}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">قيود جديدة اليوم</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs for organized view */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="approvals">الموافقات</TabsTrigger>
            <TabsTrigger value="entries">القيود الأخيرة</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Suspense fallback={<TableSkeleton />}>
              <AccountingStats />
            </Suspense>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  الموافقات المعلقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {approvalsLoading ? (
                  <TableSkeleton />
                ) : pendingApprovals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p>لا توجد موافقات معلقة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingApprovals.map((approval) => (
                      <div
                        key={approval.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">
                              {approval.journal_entry?.entry_number || 'قيد محاسبي'}
                            </p>
                            {getStatusBadge(approval.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {approval.journal_entry?.description || 'لا يوجد وصف'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            المراجع: {approval.approver_name}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedApproval(approval);
                            setIsApprovalDialogOpen(true);
                          }}
                        >
                          مراجعة
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entries" className="space-y-4">
            <Suspense fallback={<TableSkeleton />}>
              <RecentJournalEntries />
            </Suspense>
        </TabsContent>

        {/* Quick Actions - Inside Stats Tab */}
        <TabsContent value="stats" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الإحصائيات المحاسبية</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TableSkeleton />}>
                <AccountingStats />
              </Suspense>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:gap-3 grid-cols-2 md:grid-cols-4">
                <Button 
                  variant="outline" 
                  className="w-full text-xs sm:text-sm"
                  onClick={() => window.location.href = '/accounting'}
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  قيد جديد
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-xs sm:text-sm"
                  onClick={() => window.location.href = '/reports'}
                >
                  <FileCheck className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  التقارير
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-xs sm:text-sm"
                  onClick={() => window.location.href = '/approvals'}
                >
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  الموافقات
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-xs sm:text-sm"
                  onClick={() => window.location.href = '/accounting'}
                >
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  الحسابات
                </Button>
              </div>
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
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default AccountantDashboard;
