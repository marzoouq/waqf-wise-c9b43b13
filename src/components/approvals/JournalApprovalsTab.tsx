import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Eye, FileText } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import ViewJournalEntryDialog from "@/components/accounting/ViewJournalEntryDialog";
import { BadgeVariant, JournalEntryWithLines } from "@/types";
import { LucideIcon } from "lucide-react";
import { useJournalApprovals } from "@/hooks/approvals";
import { useDialogState } from "@/hooks/ui/useDialogState";
import { ErrorState } from "@/components/shared/ErrorState";

export function JournalApprovalsTab() {
  const viewDialog = useDialogState<JournalEntryWithLines>();
  const { data: approvals, isLoading, error, refetch } = useJournalApprovals();

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: BadgeVariant; icon: LucideIcon }> = {
      pending: { label: "قيد المراجعة", variant: "secondary", icon: Clock },
      approved: { label: "موافق عليه", variant: "default", icon: CheckCircle },
      rejected: { label: "مرفوض", variant: "destructive", icon: XCircle },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <Badge variant={c.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {c.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل الموافقات" message={error.message} onRetry={refetch} />;
  }

  return (
    <>
      <div className="space-y-4">
        {approvals?.map((approval) => (
          <Card 
            key={approval.id} 
            className="overflow-hidden border-border/50 hover:border-border hover:shadow-md transition-all duration-300"
          >
            <CardHeader className="bg-muted/30 border-b border-border/30 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-lg font-mono flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  {approval.journal_entry?.entry_number}
                </CardTitle>
                {getStatusBadge(approval.status)}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">الوصف</p>
                  <p className="text-base font-medium">{approval.journal_entry?.description}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">تاريخ القيد</p>
                  <p className="text-base">
                    {format(new Date(approval.journal_entry?.entry_date), "dd MMM yyyy", {
                      locale: ar,
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">المعتمد</p>
                  <p className="text-base font-medium">{approval.approver_name}</p>
                </div>
              </div>
              {approval.notes && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">ملاحظات:</p>
                  <p className="text-sm">{approval.notes}</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-border/30">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    if (approval.journal_entry) {
                      viewDialog.open(approval.journal_entry as JournalEntryWithLines);
                    }
                  }}
                >
                  <Eye className="h-4 w-4" />
                  عرض القيد
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {approvals?.length === 0 && (
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">لا توجد موافقات قيود محاسبية</p>
              <p className="text-sm text-muted-foreground/70 mt-1">ستظهر القيود المعلقة هنا عند إضافتها</p>
            </CardContent>
          </Card>
        )}
      </div>

      {viewDialog.data && (
        <ViewJournalEntryDialog
          open={viewDialog.isOpen}
          onOpenChange={(open) => !open && viewDialog.close()}
          entry={viewDialog.data}
        />
      )}
    </>
  );
}
