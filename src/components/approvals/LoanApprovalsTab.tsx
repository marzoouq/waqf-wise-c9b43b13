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
            <Card 
              key={loan.id}
              className="overflow-hidden border-border/50 hover:border-border hover:shadow-md transition-all duration-300"
            >
              <CardHeader className="bg-gradient-to-l from-amber-50 to-transparent dark:from-amber-950/30 dark:to-transparent border-b border-border/30 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    قرض رقم {loan.loan_number}
                  </CardTitle>
                  {getStatusBadge(loan.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">المستفيد</p>
                    <p className="text-base font-semibold">{loan.beneficiaries?.full_name}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">مبلغ القرض</p>
                    <p className="text-lg font-bold text-primary">
                      {loan.loan_amount?.toLocaleString("ar-SA")} ريال
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">المدة</p>
                    <p className="text-base font-medium">{loan.term_months} شهر</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">تقدم الموافقات</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ 
                            width: `${(parseInt(getApprovalProgress(loan.loan_approvals).split('/')[0]) / 3) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {getApprovalProgress(loan.loan_approvals)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* عرض الموافقات */}
                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">مستويات الموافقة:</p>
                  <div className="flex flex-wrap gap-2">
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

                {/* أزرار الموافقة */}
                {canApprove && (
                  <div className="mt-4 pt-4 border-t border-border/30 flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleApprovalClick(loan, "approve")}
                      disabled={isApproving}
                    >
                      <CheckCircle className="h-4 w-4" />
                      موافقة
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleApprovalClick(loan, "reject")}
                      disabled={isApproving}
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

        {loans?.length === 0 && (
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">لا توجد قروض بحاجة للموافقة</p>
              <p className="text-sm text-muted-foreground/70 mt-1">ستظهر القروض المعلقة هنا عند إضافتها</p>
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
            <div className="bg-muted p-3 rounded-lg">
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
