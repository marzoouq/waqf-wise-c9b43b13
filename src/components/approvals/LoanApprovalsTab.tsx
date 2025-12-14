import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLoanApprovals } from "@/hooks/approvals/useLoanApprovals";
import { LoanForApproval, LoanApprovalRow, getNextPendingApproval, BadgeVariant } from "@/types";
import { ErrorState } from "@/components/shared/ErrorState";

export function LoanApprovalsTab() {
  const { loans, isLoading, approveLoan, isApproving, error, refetch } = useLoanApprovals();
  const [selectedLoan, setSelectedLoan] = useState<LoanForApproval | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");

  const handleApprovalClick = (loan: LoanForApproval, action: "approve" | "reject") => {
    setSelectedLoan(loan);
    setApprovalAction(action);
    setIsDialogOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedLoan) return;

    const pendingApproval = selectedLoan.loan_approvals?.find(
      (a) => a.status === "معلق"
    );

    if (!pendingApproval) return;

    await approveLoan({
      loanId: selectedLoan.id,
      approvalId: pendingApproval.id,
      action: approvalAction,
      notes: approvalNotes
    });

    setIsDialogOpen(false);
    setSelectedLoan(null);
    setApprovalNotes("");
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

  const getApprovalProgress = (approvals: Pick<LoanApprovalRow, 'status'>[]) => {
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

  if (error) {
    return <ErrorState title="خطأ في تحميل القروض" message={error.message} onRetry={refetch} />;
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
                      disabled={isApproving}
                    >
                      <CheckCircle className="h-4 w-4 ms-1" />
                      موافقة
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleApprovalClick(loan, "reject")}
                      disabled={isApproving}
                    >
                      <XCircle className="h-4 w-4 ms-1" />
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
            disabled={isApproving}
          >
            {isApproving ? "جاري المعالجة..." : "تأكيد"}
          </Button>
        </div>
      </ResponsiveDialog>
    </>
  );
}
