import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { useState } from "react";
import { RequestWithBeneficiary, StatusConfigMap } from "@/types/approvals";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRequestApprovals } from "@/hooks/approvals";
import { useDialogState } from "@/hooks/ui/useDialogState";
import { ErrorState } from "@/components/shared/ErrorState";

export function RequestApprovalsTab() {
  const approveDialog = useDialogState<RequestWithBeneficiary>();
  const rejectDialog = useDialogState<RequestWithBeneficiary>();
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: requests, isLoading, error, refetch, approveMutation, rejectMutation } = useRequestApprovals();

  const getStatusBadge = (status: string) => {
    const config: StatusConfigMap = {
      "قيد المراجعة": { label: "قيد المراجعة", variant: "secondary", icon: Clock },
      "موافق عليه": { label: "موافق عليه", variant: "default", icon: CheckCircle },
      "مرفوض": { label: "مرفوض", variant: "destructive", icon: XCircle },
    };
    const c = config[status] || config["قيد المراجعة"];
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
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل موافقات الطلبات" onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      {requests?.map((request) => (
        <Card 
          key={request.id}
          className="overflow-hidden border-border/50 hover:border-border hover:shadow-md transition-all duration-300"
        >
          <CardHeader className="bg-gradient-to-l from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent border-b border-border/30 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">📋</span>
                </div>
                {request.request_number}
              </CardTitle>
              {getStatusBadge(request.status)}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">نوع الطلب</p>
                <p className="text-base font-semibold">{request.request_types?.name_ar}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">المستفيد</p>
                <p className="text-base">{request.beneficiaries?.full_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">تاريخ الطلب</p>
                <p className="text-base">
                  {format(new Date(request.submitted_at), "dd MMM yyyy", { locale: ar })}
                </p>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => approveDialog.open(request)}
                  disabled={request.status !== 'قيد المراجعة'}
                >
                  <CheckCircle className="h-4 w-4" />
                  موافقة
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1.5"
                  onClick={() => rejectDialog.open(request)}
                  disabled={request.status !== 'قيد المراجعة'}
                >
                  <XCircle className="h-4 w-4" />
                  رفض
                </Button>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">الوصف:</p>
              <p className="text-sm">{request.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {requests?.length === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardContent className="text-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">لا توجد طلبات بحاجة للموافقة</p>
            <p className="text-sm text-muted-foreground/70 mt-1">ستظهر الطلبات المعلقة هنا عند إضافتها</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={approveDialog.isOpen} onOpenChange={(open) => !open && approveDialog.close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>الموافقة على الطلب</DialogTitle>
            <DialogDescription>
              أنت على وشك الموافقة على الطلب {approveDialog.data?.request_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف أي ملاحظات..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => approveDialog.close()}>
              إلغاء
            </Button>
            <Button 
              onClick={() => {
                if (approveDialog.data) {
                  approveMutation.mutate({ requestId: approveDialog.data.id, notes }, {
                    onSuccess: () => {
                      approveDialog.close();
                      setNotes("");
                    }
                  });
                }
              }} 
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "جاري المعالجة..." : "تأكيد الموافقة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialog.isOpen} onOpenChange={(open) => !open && rejectDialog.close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض الطلب</DialogTitle>
            <DialogDescription>
              أنت على وشك رفض الطلب {rejectDialog.data?.request_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">سبب الرفض *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="يرجى كتابة سبب الرفض..."
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => rejectDialog.close()}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (rejectDialog.data) {
                  rejectMutation.mutate({ requestId: rejectDialog.data.id, reason: rejectionReason }, {
                    onSuccess: () => {
                      rejectDialog.close();
                      setRejectionReason("");
                    }
                  });
                }
              }}
              disabled={!rejectionReason || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "جاري المعالجة..." : "تأكيد الرفض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
