import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Receipt, CreditCard } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useApprovalHistory } from "@/hooks/useApprovalHistory";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PaymentForApproval, PaymentApprovalRow, calculateProgress, getNextPendingApproval, StatusConfigMap, BadgeVariant } from "@/types";

export function PaymentApprovalsTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToHistory } = useApprovalHistory();
  const [selectedPayment, setSelectedPayment] = useState<PaymentForApproval | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");

  const { data: payments, isLoading} = useQuery<PaymentForApproval[]>({
    queryKey: ["payments_with_approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          beneficiaries(full_name, national_id),
          payment_approvals(*)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []) as unknown as PaymentForApproval[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ paymentId, approvalId, action, notes }: {
      paymentId: string;
      approvalId: string;
      action: "approve" | "reject";
      notes: string;
    }) => {
      const status = action === "approve" ? "موافق" : "مرفوض";
      
      const { error } = await supabase
        .from("payment_approvals")
        .update({
          status,
          notes,
          approved_at: new Date().toISOString(),
          approver_id: user?.id
        })
        .eq("id", approvalId);

      if (error) throw error;

      // سجل في تاريخ الموافقات
      await addToHistory.mutateAsync({
        approval_type: "payment",
        approval_id: approvalId,
        reference_id: paymentId,
        action: action === "approve" ? "approved" : "rejected",
        performed_by: user?.id || "",
        performed_by_name: user?.user_metadata?.full_name || "مستخدم",
        notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments_with_approvals"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      
      toast({
        title: "تمت العملية بنجاح",
        description: approvalAction === "approve" ? "تمت الموافقة على المدفوعة" : "تم رفض المدفوعة"
      });
      
      setIsDialogOpen(false);
      setSelectedPayment(null);
      setApprovalNotes("");
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ في العملية";
      toast({
        title: "خطأ في العملية",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const handleApprovalClick = (payment: PaymentForApproval, action: "approve" | "reject") => {
    setSelectedPayment(payment);
    setApprovalAction(action);
    setIsDialogOpen(true);
  };

  const handleConfirmApproval = () => {
    if (!selectedPayment) return;

    const pendingApproval = selectedPayment.payment_approvals?.find(
      (a) => a.status === "معلق"
    );

    if (!pendingApproval) {
      toast({
        title: "لا توجد موافقة معلقة",
        variant: "destructive"
      });
      return;
    }

    approveMutation.mutate({
      paymentId: selectedPayment.id,
      approvalId: pendingApproval.id,
      action: approvalAction,
      notes: approvalNotes
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
    const approved = approvals?.filter((a) => a.status === "موافق").length || 0;
    return `${approved}/${total}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
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
            <Card key={payment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    سند رقم {payment.payment_number}
                  </CardTitle>
                  <div className="flex gap-2">
                    {getPaymentTypeBadge(payment.payment_type)}
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">اسم الدافع/المستلم</p>
                    <p className="text-base font-semibold">{payment.payer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المبلغ</p>
                    <p className="text-lg font-bold text-primary">
                      {payment.amount?.toLocaleString("ar-SA")} ريال
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">التاريخ</p>
                    <p className="text-base">
                      {format(new Date(payment.payment_date), "dd MMM yyyy", { locale: ar })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">تقدم الموافقات</p>
                    <p className="text-lg font-semibold">
                      {getApprovalProgress(payment.payment_approvals)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-1">الوصف:</p>
                  <p className="text-sm">{payment.description}</p>
                </div>

                {/* عرض الموافقات */}
                {payment.payment_approvals && payment.payment_approvals.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold mb-2">مستويات الموافقة:</p>
                    <div className="flex gap-2">
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
                        >
                          {approval.approver_name}: {approval.status}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* أزرار الموافقة */}
                {canApprove && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprovalClick(payment, "approve")}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 ml-1" />
                      موافقة
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleApprovalClick(payment, "reject")}
                      disabled={approveMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 ml-1" />
                      رفض
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {payments?.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد مدفوعات بحاجة للموافقة</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog للموافقة/الرفض */}
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
              <div className="bg-muted p-3 rounded-md">
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
