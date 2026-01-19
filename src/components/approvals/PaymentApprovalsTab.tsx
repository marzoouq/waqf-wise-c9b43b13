import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Receipt, CreditCard } from "lucide-react";
import { matchesStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PaymentForApproval, PaymentApprovalRow, BadgeVariant } from "@/types";
import { usePaymentApprovals } from "@/hooks/approvals";
import { ErrorState } from "@/components/shared/ErrorState";

export function PaymentApprovalsTab() {
  const [selectedPayment, setSelectedPayment] = useState<PaymentForApproval | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");

  const { data: payments, isLoading, error, refetch, approveMutation } = usePaymentApprovals();

  const handleApprovalClick = (payment: PaymentForApproval, action: "approve" | "reject") => {
    setSelectedPayment(payment);
    setApprovalAction(action);
    setIsDialogOpen(true);
  };

  const handleConfirmApproval = () => {
    if (!selectedPayment) return;

    const pendingApproval = selectedPayment.payment_approvals?.find(
      (a) => matchesStatus(a.status, 'pending')
    );

    if (!pendingApproval) return;

    approveMutation.mutate({
      paymentId: selectedPayment.id,
      approvalId: pendingApproval.id,
      action: approvalAction,
      notes: approvalNotes
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setSelectedPayment(null);
        setApprovalNotes("");
      }
    });
  };

  const getPaymentTypeIcon = (type: string) => {
    return type === "receipt" ? Receipt : CreditCard;
  };

  const getPaymentTypeBadge = (type: string) => {
    const config = {
      receipt: { label: "قبض", variant: "default" as const },
      payment: { label: "صرف", variant: "secondary" as const },
    };
    const c = config[type as keyof typeof config] || config.receipt;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: BadgeVariant; icon: LucideIcon }> = {
      "pending": { label: "معلق", variant: "secondary", icon: Clock },
      "completed": { label: "مكتمل", variant: "default", icon: CheckCircle },
      "cancelled": { label: "ملغي", variant: "destructive", icon: XCircle },
    };
    const c = config[status] || config["pending"];
    const Icon = c.icon;
    return (
      <Badge variant={c.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {c.label}
      </Badge>
    );
  };

  const getApprovalProgress = (approvals: PaymentApprovalRow[]) => {
    const total = 2;
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
    return <ErrorState title="خطأ في تحميل موافقات المدفوعات" message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <>
      <div className="space-y-4">
        {payments?.map((payment) => {
          const pendingApproval = payment.payment_approvals?.find(
            (a) => a.status === "معلق"
          );
          const canApprove = pendingApproval !== undefined;
          const Icon = getPaymentTypeIcon(payment.payment_type);

          return (
            <Card 
              key={payment.id}
              className="overflow-hidden border-border/50 hover:border-border hover:shadow-md transition-all duration-300"
            >
              <CardHeader className={cn(
                "border-b border-border/30 pb-4",
                payment.payment_type === "receipt" 
                  ? "bg-gradient-to-l from-green-50 to-transparent dark:from-green-950/30 dark:to-transparent"
                  : "bg-gradient-to-l from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent"
              )}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center",
                      payment.payment_type === "receipt" 
                        ? "bg-green-500/10" 
                        : "bg-blue-500/10"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        payment.payment_type === "receipt"
                          ? "text-green-600 dark:text-green-400"
                          : "text-blue-600 dark:text-blue-400"
                      )} />
                    </div>
                    سند رقم {payment.payment_number}
                  </CardTitle>
                  <div className="flex gap-2">
                    {getPaymentTypeBadge(payment.payment_type)}
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">اسم الدافع/المستلم</p>
                    <p className="text-base font-semibold">{payment.payer_name}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">المبلغ</p>
                    <p className="text-lg font-bold text-primary">
                      {payment.amount?.toLocaleString("ar-SA")} ريال
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">التاريخ</p>
                    <p className="text-base">
                      {format(new Date(payment.payment_date), "dd MMM yyyy", { locale: ar })}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">تقدم الموافقات</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ 
                            width: `${(parseInt(getApprovalProgress(payment.payment_approvals).split('/')[0]) / 2) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {getApprovalProgress(payment.payment_approvals)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">الوصف:</p>
                  <p className="text-sm">{payment.description}</p>
                </div>

                {payment.payment_approvals && payment.payment_approvals.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">مستويات الموافقة:</p>
                    <div className="flex flex-wrap gap-2">
                      {payment.payment_approvals.map((approval) => (
                        <Badge
                          key={approval.id}
                          variant={
                            approval.status === "موافق"
                              ? "default"
                              : approval.status === "مرفوض"
                              ? "destructive"
                              : "secondary"
                          }
                          className="gap-1"
                        >
                          {approval.status === "موافق" && <CheckCircle className="h-3 w-3" />}
                          {approval.status === "مرفوض" && <XCircle className="h-3 w-3" />}
                          {approval.status === "معلق" && <Clock className="h-3 w-3" />}
                          {approval.approver_name}: {approval.status}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {canApprove && (
                  <div className="mt-4 pt-4 border-t border-border/30 flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleApprovalClick(payment, "approve")}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4" />
                      موافقة
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleApprovalClick(payment, "reject")}
                      disabled={approveMutation.isPending}
                    >
                      <XCircle className="h-4 w-4" />
                      رفض
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {payments?.length === 0 && (
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">لا توجد مدفوعات بحاجة للموافقة</p>
              <p className="text-sm text-muted-foreground/70 mt-1">ستظهر المدفوعات المعلقة هنا عند إضافتها</p>
            </CardContent>
          </Card>
        )}
      </div>

      <ResponsiveDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        title={approvalAction === "approve" ? "تأكيد الموافقة" : "تأكيد الرفض"}
        description={approvalAction === "approve"
          ? "هل أنت متأكد من الموافقة على هذه المدفوعة؟"
          : "هل أنت متأكد من رفض هذه المدفوعة؟"}
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">
                <strong>رقم السند:</strong> {selectedPayment.payment_number}
              </p>
              <p className="text-sm">
                <strong>النوع:</strong> {selectedPayment.payment_type === "receipt" ? "قبض" : "صرف"}
              </p>
              <p className="text-sm">
                <strong>المبلغ:</strong>{" "}
                {selectedPayment.amount?.toLocaleString("ar-SA")} ريال
              </p>
              <p className="text-sm">
                <strong>المستفيد:</strong> {selectedPayment.beneficiaries?.full_name || 'غير محدد'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="أضف ملاحظاتك هنا..."
                rows={3}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsDialogOpen(false);
              setSelectedPayment(null);
              setApprovalNotes("");
            }}
          >
            إلغاء
          </Button>
          <Button
            variant={approvalAction === "approve" ? "default" : "destructive"}
            onClick={handleConfirmApproval}
            disabled={approveMutation.isPending}
          >
            {approveMutation.isPending ? "جاري المعالجة..." : "تأكيد"}
          </Button>
        </div>
      </ResponsiveDialog>
    </>
  );
}
