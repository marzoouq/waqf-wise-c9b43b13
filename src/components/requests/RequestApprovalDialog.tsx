import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, User } from "lucide-react";
import { useRequestApprovals } from "@/hooks/requests/useRequestApprovals";
import { useAuth } from "@/hooks/useAuth";
import { format, arLocale as ar } from "@/lib/date";

interface RequestApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  requestType: string;
  requestDescription: string;
}

const APPROVAL_LEVELS = [
  { level: 1, name: "المشرف", role: "admin" },
  { level: 2, name: "المحاسب", role: "accountant" },
  { level: 3, name: "الناظر", role: "nazer" },
];

export function RequestApprovalDialog({
  open,
  onOpenChange,
  requestId,
  requestType,
  requestDescription,
}: RequestApprovalDialogProps) {
  const { user } = useAuth();
  const { approvals, isLoading, addApproval, getCurrentLevel } = 
    useRequestApprovals(requestId);
  const [notes, setNotes] = useState("");

  const handleApprove = async () => {
    const currentLevel = getCurrentLevel();
    
    await addApproval({
      request_id: requestId,
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
      request_id: requestId,
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
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "مرفوض":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "موافق":
        return <Badge className="bg-success">موافق</Badge>;
      case "مرفوض":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">معلق</Badge>;
    }
  };

  const currentLevel = getCurrentLevel();
  const canApprove = currentLevel <= 3;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="مسار موافقات الطلب"
      description={`${requestType} - ${requestDescription}`}
      size="lg"
    >
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
                    <CheckCircle2 className="h-4 w-4 ms-2" />
                    موافقة
                  </Button>
                  <Button onClick={handleReject} variant="destructive" className="flex-1">
                    <XCircle className="h-4 w-4 ms-2" />
                    رفض
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!canApprove && (
            <Card className="bg-success-light dark:bg-success/10 border-success/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-semibold">تم اعتماد الطلب من جميع المستويات</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
    </ResponsiveDialog>
  );
}
