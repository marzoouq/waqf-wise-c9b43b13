import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Eye, DollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoanForApproval, calculateProgress, getNextPendingApproval, StatusConfigMap, BadgeVariant } from "@/types/approvals";

export function LoanApprovalsTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLoan, setSelectedLoan] = useState<LoanForApproval | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");

  const { data: loans, isLoading } = useQuery<LoanForApproval[]>({
    queryKey: ["loans_with_approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans")
        .select(`
          *,
          beneficiaries(full_name, national_id),
          loan_approvals(*)
        `)
        .in("status", ["pending", "active"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as LoanForApproval[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ loanId, approvalId, action, notes }: {
      loanId: string;
      approvalId: string;
      action: "approve" | "reject";
      notes: string;
    }) => {
      const status = action === "approve" ? "موافق" : "مرفوض";
      
      const { error } = await supabase
        .from("loan_approvals")
        .update({
          status,
          notes,
          approved_at: new Date().toISOString(),
          approver_id: user?.id
        })
        .eq("id", approvalId);

      if (error) throw error;

      // سجل في تاريخ الموافقات
      await supabase.from("approval_history").insert({
        approval_type: "loan",
        approval_id: approvalId,
        reference_id: loanId,
        action: action === "approve" ? "approved" : "rejected",
        performed_by: user?.id,
        performed_by_name: user?.user_metadata?.full_name || "مستخدم",
        notes
      });

      // إذا تمت الموافقة النهائية، إنشاء القيد المحاسبي
      if (action === "approve") {
        const { data: loan } = await supabase
          .from("loans")
          .select("loan_number, loan_amount, beneficiaries(full_name)")
          .eq("id", loanId)
          .single();

        const { data: allApprovals } = await supabase
          .from("loan_approvals")
          .select("status")
          .eq("loan_id", loanId);

        const allApproved = allApprovals?.every((a) => a.status === "موافق");

        if (allApproved && loan) {
          // إنشاء القيد المحاسبي
          await supabase.rpc("create_auto_journal_entry", {
            p_trigger_event: 'loan_approved',
            p_reference_id: loanId,
            p_amount: loan.loan_amount,
            p_description: `صرف قرض ${loan.loan_number} - ${(loan.beneficiaries as { full_name: string }).full_name}`,
            p_transaction_date: new Date().toISOString().split('T')[0]
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans_with_approvals"] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      
      toast({
        title: "تمت العملية بنجاح",
        description: approvalAction === "approve" ? "تمت الموافقة على القرض" : "تم رفض القرض"
      });
      
      setIsDialogOpen(false);
      setSelectedLoan(null);
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

  const handleApprovalClick = (loan: LoanForApproval, action: "approve" | "reject") => {
    setSelectedLoan(loan);
    setApprovalAction(action);
    setIsDialogOpen(true);
  };

  const handleConfirmApproval = () => {
    if (!selectedLoan) return;

    const pendingApproval = selectedLoan.loan_approvals?.find(
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
      loanId: selectedLoan.id,
      approvalId: pendingApproval.id,
      action: approvalAction,
      notes: approvalNotes
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: BadgeVariant; icon: LucideIcon }> = {
      "pending": { label: "معلق", variant: "secondary", icon: Clock },
      "active": { label: "نشط", variant: "default", icon: CheckCircle },
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

  const getApprovalProgress = (approvals: any[]) => {
    const total = 3;
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
        {loans?.map((loan: LoanForApproval) => {
          const pendingApproval = getNextPendingApproval(loan.loan_approvals);
          const canApprove = pendingApproval !== undefined;

          return (
            <Card key={loan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    قرض رقم {loan.loan_number}
                  </CardTitle>
                  {getStatusBadge(loan.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">المستفيد</p>
                    <p className="text-base font-semibold">{loan.beneficiaries?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">مبلغ القرض</p>
                    <p className="text-lg font-bold text-primary">
                      {loan.loan_amount?.toLocaleString("ar-SA")} ريال
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المدة</p>
                    <p className="text-base">{loan.term_months} شهر</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">تقدم الموافقات</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold">
                        {getApprovalProgress(loan.loan_approvals)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* عرض الموافقات */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold mb-2">مستويات الموافقة:</p>
                  <div className="flex gap-2">
                    {loan.loan_approvals?.map((approval) => (
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

                {/* أزرار الموافقة */}
                {canApprove && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprovalClick(loan, "approve")}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 ml-1" />
                      موافقة
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleApprovalClick(loan, "reject")}
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

        {loans?.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد قروض بحاجة للموافقة</p>
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
          ? "هل أنت متأكد من الموافقة على هذا القرض؟"
          : "هل أنت متأكد من رفض هذا القرض؟"}
      >
        {selectedLoan && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">
                  <strong>المستفيد:</strong> {selectedLoan.beneficiaries?.full_name}
                </p>
                <p className="text-sm">
                  <strong>المبلغ:</strong>{" "}
                  {selectedLoan.loan_amount?.toLocaleString("ar-SA")} ريال
                </p>
                <p className="text-sm">
                  <strong>المدة:</strong> {selectedLoan.term_months} شهر
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
                setSelectedLoan(null);
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
