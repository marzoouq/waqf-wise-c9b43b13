import { useState, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DollarSign, AlertCircle, CheckCircle, XCircle, TrendingUp, FileCheck, FileClock, LayoutDashboard, Mail } from "lucide-react";
import { useAccountantKPIs } from "@/hooks/useAccountantKPIs";
import { ApproveJournalDialog } from "@/components/accounting/ApproveJournalDialog";
import { UnifiedDashboardLayout } from "@/components/dashboard/UnifiedDashboardLayout";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { SectionSkeleton } from "@/components/dashboard";
import { AdminSendMessageDialog } from "@/components/messages/AdminSendMessageDialog";

// Lazy load components
const AccountingStats = lazy(() => import("@/components/dashboard/AccountingStats"));
const RecentJournalEntries = lazy(() => import("@/components/dashboard/RecentJournalEntries"));

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
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  
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
    <UnifiedDashboardLayout
      role="accountant"
      actions={
        <Button onClick={() => setMessageDialogOpen(true)} className="gap-2">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">إرسال رسالة</span>
        </Button>
      }
    >
      {/* Statistics Cards */}
      {kpisLoading ? (
        <SectionSkeleton />
      ) : (
        <UnifiedStatsGrid columns={4}>
          <UnifiedKPICard
            title="موافقات معلقة"
            value={kpis?.pendingApprovals || 0}
            icon={AlertCircle}
            variant="warning"
            subtitle="تحتاج مراجعة"
          />
          <UnifiedKPICard
            title="قيود مسودة"
            value={kpis?.draftEntries || 0}
            icon={FileClock}
            variant="default"
            subtitle="غير مرحّلة"
          />
          <UnifiedKPICard
            title="قيود مرحّلة"
            value={kpis?.postedEntries || 0}
            icon={FileCheck}
            variant="success"
            subtitle="معتمدة ومرحّلة"
          />
          <UnifiedKPICard
            title="قيود اليوم"
            value={kpis?.todayEntries || 0}
            icon={TrendingUp}
            variant="default"
            subtitle="قيود جديدة اليوم"
          />
        </UnifiedStatsGrid>
      )}

      {/* Tabs for organized view */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50">
          <TabsTrigger 
            value="overview" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">نظرة عامة</span>
          </TabsTrigger>
          <TabsTrigger 
            value="approvals"
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">الموافقات</span>
          </TabsTrigger>
          <TabsTrigger 
            value="entries"
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">القيود الأخيرة</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<SectionSkeleton />}>
            <AccountingStats />
          </Suspense>
        </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  الموافقات المعلقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {approvalsLoading ? (
                  <SectionSkeleton />
                ) : pendingApprovals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success" />
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
          <Suspense fallback={<SectionSkeleton />}>
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
              <Suspense fallback={<SectionSkeleton />}>
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

      {/* Message Dialog */}
      <AdminSendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
      />
    </UnifiedDashboardLayout>
  );
};

export default AccountantDashboard;
