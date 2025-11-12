import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, User } from "lucide-react";
import { useDistributionApprovals } from "@/hooks/useDistributionApprovals";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ApprovalFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distributionId: string;
  distributionMonth: string;
  distributionAmount: number;
}

const APPROVAL_LEVELS = [
  { level: 1, name: "محاسب", role: "accountant" },
  { level: 2, name: "مدير مالي", role: "financial_manager" },
  { level: 3, name: "ناظر", role: "admin" },
];

export function ApprovalFlowDialog({
  open,
  onOpenChange,
  distributionId,
  distributionMonth,
  distributionAmount,
}: ApprovalFlowDialogProps) {
  const { user } = useAuth();
  const { approvals, isLoading, addApproval, updateApproval, getCurrentLevel } = 
    useDistributionApprovals(distributionId);
  const [notes, setNotes] = useState("");

  const handleApprove = async () => {
    const currentLevel = getCurrentLevel();
    
    // التحقق من أن المستخدم له صلاحية الموافقة على هذا المستوى
    const levelInfo = APPROVAL_LEVELS.find(l => l.level === currentLevel);
    
    await addApproval({
      distribution_id: distributionId,
      level: currentLevel,
      approver_id: user?.id,
      approver_name: user?.email || "مستخدم",
      status: "موافق",
      notes: notes || undefined,
      approved_at: new Date().toISOString(),
    });

    setNotes("");
  };

  const handleReject = async () => {
    const currentLevel = getCurrentLevel();
    
    await addApproval({
      distribution_id: distributionId,
      level: currentLevel,
      approver_id: user?.id,
      approver_name: user?.email || "مستخدم",
      status: "مرفوض",
      notes: notes || undefined,
      approved_at: new Date().toISOString(),
    });

    setNotes("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "موافق":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "مرفوض":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "موافق":
        return <Badge className="bg-green-500">موافق</Badge>;
      case "مرفوض":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">معلق</Badge>;
    }
  };

  const currentLevel = getCurrentLevel();
  const canApprove = currentLevel <= 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>مسار موافقات التوزيع</DialogTitle>
          <DialogDescription>
            توزيع {distributionMonth} - المبلغ: {distributionAmount.toLocaleString()} ر.س
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* مستويات الموافقة */}
          {APPROVAL_LEVELS.map((levelInfo) => {
            const approval = approvals.find(a => a.level === levelInfo.level);
            const isCurrentLevel = currentLevel === levelInfo.level;

            return (
              <Card key={levelInfo.level} className={isCurrentLevel ? "border-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {approval ? getStatusIcon(approval.status) : <User className="h-5 w-5 text-muted-foreground" />}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">المستوى {levelInfo.level}: {levelInfo.name}</h4>
                          {approval && getStatusBadge(approval.status)}
                        </div>
                        {approval && (
                          <>
                            <p className="text-sm text-muted-foreground">
                              {approval.approver_name}
                            </p>
                            {approval.approved_at && (
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(approval.approved_at), "dd MMMM yyyy - HH:mm", { locale: ar })}
                              </p>
                            )}
                            {approval.notes && (
                              <p className="text-sm mt-2 p-2 bg-muted rounded-md">
                                {approval.notes}
                              </p>
                            )}
                          </>
                        )}
                        {!approval && isCurrentLevel && (
                          <p className="text-sm text-muted-foreground">في انتظار الموافقة</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* نموذج الموافقة/الرفض */}
          {canApprove && (
            <Card className="border-dashed">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold">إجراء الموافقة</h4>
                <Textarea
                  placeholder="أضف ملاحظات (اختياري)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={handleApprove} className="flex-1">
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                    موافقة
                  </Button>
                  <Button onClick={handleReject} variant="destructive" className="flex-1">
                    <XCircle className="h-4 w-4 ml-2" />
                    رفض
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!canApprove && (
            <Card className="bg-green-50 dark:bg-green-900/10 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-semibold">تم اعتماد التوزيع من جميع المستويات</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
