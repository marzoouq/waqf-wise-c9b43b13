import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Eye, Lock } from "lucide-react";
import { matchesStatus } from "@/lib/constants";
import { format, arLocale as ar } from "@/lib/date";
import { ApprovalFlowDialog } from "@/components/funds/ApprovalFlowDialog";
import { DistributionForApproval, StatusConfigMap } from "@/types/approvals";
import { useApprovalPermissions } from "@/hooks/requests/useApprovalPermissions";
import { useDistributionApprovals } from "@/hooks/approvals";
import { useDialogState } from "@/hooks/ui/useDialogState";
import { ErrorState } from "@/components/shared/ErrorState";

export function DistributionApprovalsTab() {
  const flowDialog = useDialogState<DistributionForApproval>();
  const { canApproveLevel, userRole } = useApprovalPermissions();

  const { data: distributions, isLoading, error, refetch } = useDistributionApprovals();

  const getStatusBadge = (status: string) => {
    const config: StatusConfigMap = {
      "معلق": { label: "معلق", variant: "secondary", icon: Clock },
      "معتمد": { label: "معتمد", variant: "default", icon: CheckCircle },
      "مرفوض": { label: "مرفوض", variant: "destructive", icon: XCircle },
    };
    const c = config[status] || config["معلق"];
    const Icon = c.icon;
    return (
      <Badge variant={c.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {c.label}
      </Badge>
    );
  };

  const getApprovalProgress = (approvals: Array<{ status: string }> | undefined) => {
    const total = 3;
    const approved = approvals?.filter((a) => matchesStatus(a.status, 'approved')).length || 0;
    return `${approved}/${total}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل توزيعات الموافقات" message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <>
      <div className="space-y-4">
        {distributions?.map((dist) => (
          <Card 
            key={dist.id}
            className="overflow-hidden border-border/50 hover:border-border hover:shadow-md transition-all duration-300"
          >
            <CardHeader className="bg-gradient-to-l from-emerald-50 to-transparent dark:from-emerald-950/30 dark:to-transparent border-b border-border/30 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">📊</span>
                  </div>
                  توزيع شهر {dist.month}
                </CardTitle>
                {getStatusBadge(dist.status)}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">المبلغ الإجمالي</p>
                  <p className="text-lg font-bold text-primary">
                    {dist.total_amount?.toLocaleString("ar-SA")} ريال
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">عدد المستفيدين</p>
                  <p className="text-lg font-semibold">{dist.beneficiaries_count}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">تاريخ التوزيع</p>
                  <p className="text-base font-medium">
                    {format(new Date(dist.distribution_date), "dd MMM yyyy", { locale: ar })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">تقدم الموافقات</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ 
                          width: `${(parseInt(getApprovalProgress(dist.distribution_approvals).split('/')[0]) / 3) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold">
                      {getApprovalProgress(dist.distribution_approvals)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border/30 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => flowDialog.open(dist)}
                >
                  <Eye className="h-4 w-4" />
                  عرض التفاصيل
                </Button>
                {userRole && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Lock className="h-3 w-3" />
                    {userRole === 'nazer' ? 'ناظر' : userRole === 'accountant' ? 'محاسب' : userRole}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {distributions?.length === 0 && (
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">لا توجد توزيعات بحاجة للموافقة</p>
              <p className="text-sm text-muted-foreground/70 mt-1">ستظهر التوزيعات المعلقة هنا عند إضافتها</p>
            </CardContent>
          </Card>
        )}
      </div>

      {flowDialog.data && (
        <ApprovalFlowDialog
          open={flowDialog.isOpen}
          onOpenChange={(open) => !open && flowDialog.close()}
          distributionId={flowDialog.data.id}
          distributionMonth={flowDialog.data.month}
          distributionAmount={flowDialog.data.total_amount}
        />
      )}
    </>
  );
}
