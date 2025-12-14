import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
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
          <Card key={approval.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono">
                  {approval.journal_entry?.entry_number}
                </CardTitle>
                {getStatusBadge(approval.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">الوصف</p>
                  <p className="text-base">{approval.journal_entry?.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ القيد</p>
                  <p className="text-base">
                    {format(new Date(approval.journal_entry?.entry_date), "dd MMM yyyy", {
                      locale: ar,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المعتمد</p>
                  <p className="text-base">{approval.approver_name}</p>
                </div>
              </div>
              {approval.notes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">ملاحظات:</p>
                  <p className="text-sm">{approval.notes}</p>
                </div>
              )}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (approval.journal_entry) {
                      viewDialog.open(approval.journal_entry as JournalEntryWithLines);
                    }
                  }}
                >
                  <Eye className="h-4 w-4 ms-1" />
                  عرض القيد
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {approvals?.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد موافقات قيود محاسبية</p>
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
