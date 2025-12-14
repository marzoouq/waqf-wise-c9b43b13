import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { useApprovalsLog } from "@/hooks/beneficiary/useBeneficiaryTabsData";
import { format, arLocale as ar } from "@/lib/date";
import { ErrorState } from "@/components/shared/ErrorState";

export function ApprovalsLogTab() {
  const { settings } = useVisibilitySettings();
  const { data: approvals, isLoading, error, refetch } = useApprovalsLog(settings?.show_approvals_log || false);

  if (!settings?.show_approvals_log) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          غير مصرح بعرض سجل الموافقات
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل سجل الموافقات" message={error.message} onRetry={refetch} />;
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "موافق":
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "مرفوض":
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "موافق":
      case "approved":
        return <Badge className="bg-success">موافق</Badge>;
      case "مرفوض":
      case "rejected":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {approvals?.map((approval) => (
        <Card key={approval.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getActionIcon(approval.action)}
                <div>
                  <CardTitle className="text-base">{approval.approval_type}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(approval.created_at), "dd MMMM yyyy - HH:mm", { locale: ar })}
                  </p>
                </div>
              </div>
              {getActionBadge(approval.action)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {approval.performed_by_name && (
                <p className="text-sm">
                  <span className="font-medium">بواسطة:</span> {approval.performed_by_name}
                </p>
              )}
              {approval.notes && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">ملاحظات:</span> {approval.notes}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {(!approvals || approvals.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            لا يوجد سجل موافقات متاح
          </CardContent>
        </Card>
      )}
    </div>
  );
}
