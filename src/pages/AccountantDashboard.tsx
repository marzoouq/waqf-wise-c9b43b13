import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, DollarSign, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import AccountingStats from "@/components/dashboard/AccountingStats";
import RecentJournalEntries from "@/components/dashboard/RecentJournalEntries";
import { ApproveJournalDialog } from "@/components/accounting/ApproveJournalDialog";

const AccountantDashboard = () => {
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
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
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent journal entries
  const { data: recentEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["recent_entries_accountant"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate accurate stats from all data
  const { data: allStats } = useQuery({
    queryKey: ["accountant_all_stats"],
    queryFn: async () => {
      const [approvalsRes, draftRes, postedRes, cancelledRes] = await Promise.all([
        supabase.from('approvals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('status', 'posted'),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
      ]);
      
      return {
        pendingApprovals: approvalsRes.count || 0,
        draftEntries: draftRes.count || 0,
        postedEntries: postedRes.count || 0,
        cancelledEntries: cancelledRes.count || 0,
      };
    },
  });

  const stats = allStats || {
    pendingApprovals: 0,
    draftEntries: 0,
    postedEntries: 0,
    cancelledEntries: 0,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: any; icon: any }> = {
      pending: { label: "قيد المراجعة", variant: "secondary", icon: AlertCircle },
      approved: { label: "موافق عليه", variant: "default", icon: CheckCircle },
      rejected: { label: "مرفوض", variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || { label: status, variant: "outline", icon: FileText };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (approvalsLoading || entriesLoading) {
    return <LoadingState message="جاري تحميل لوحة المحاسب..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <header className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-blue-600" />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary">
                لوحة تحكم المحاسب
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                إدارة القيود المحاسبية والموافقات
              </p>
            </div>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="shadow-soft border-warning/30">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  موافقات معلقة
                </CardTitle>
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-warning">
                {stats.pendingApprovals}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  قيود مسودة
                </CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">
                {stats.draftEntries}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-success/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  قيود مرحّلة
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {stats.postedEntries}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-destructive/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  قيود ملغاة
                </CardTitle>
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {stats.cancelledEntries}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accounting Stats */}
        <AccountingStats />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl font-bold">الموافقات المعلقة</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="لا توجد موافقات معلقة"
                  description="جميع القيود تمت مراجعتها"
                  className="py-8"
                />
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((approval: any) => (
                    <div
                      key={approval.id}
                      className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-mono font-medium text-sm">
                            {approval.journal_entry?.entry_number}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {approval.journal_entry?.description}
                          </p>
                        </div>
                        {getStatusBadge(approval.status)}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-muted-foreground">
                          طلب المراجعة: {new Date(approval.created_at).toLocaleDateString("ar-SA")}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => {
                              setSelectedApproval(approval);
                              setIsApprovalDialogOpen(true);
                            }}
                          >
                            مراجعة
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Journal Entries */}
          <RecentJournalEntries />
        </div>

        {/* Quick Actions */}
        <Card className="shadow-soft bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-bold">الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-primary hover:text-primary-foreground"
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm">قيد جديد</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-primary hover:text-primary-foreground"
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-sm">سند جديد</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-primary hover:text-primary-foreground"
              >
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">مراجعة الموافقات</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-primary hover:text-primary-foreground"
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm">التقارير</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Dialog */}
      <ApproveJournalDialog 
        open={isApprovalDialogOpen} 
        onOpenChange={setIsApprovalDialogOpen}
        approval={selectedApproval}
      />
    </div>
  );
};

export default AccountantDashboard;
