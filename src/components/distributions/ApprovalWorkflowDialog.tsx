import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useDistributionApprovals } from "@/hooks/useDistributionApprovals";
import { Distribution } from "@/hooks/useDistributions";
import { CheckCircle2, XCircle, Clock, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

interface ApprovalWorkflowDialogProps {
  distribution: Distribution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApprovalWorkflowDialog({
  distribution,
  open,
  onOpenChange,
}: ApprovalWorkflowDialogProps) {
  const { user } = useAuth();
  const { primaryRole } = useUserRole();
  const { approvals, addApproval, getCurrentLevel, checkAllApproved, hasRejection } = useDistributionApprovals(distribution?.id);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentLevel = getCurrentLevel();
  const allApproved = checkAllApproved();
  const isRejected = hasRejection();

  const canApprove = () => {
    if (!distribution || isRejected || allApproved) return false;
    
    // المستوى 1: محاسب
    if (currentLevel === 1 && primaryRole === "accountant") return true;
    // المستوى 2: مدير مالي (admin)
    if (currentLevel === 2 && primaryRole === "admin") return true;
    // المستوى 3: ناظر
    if (currentLevel === 3 && primaryRole === "nazer") return true;
    
    return false;
  };

  const handleApprove = async (status: "موافق" | "مرفوض") => {
    if (!distribution || !user) return;
    
    setIsSubmitting(true);
    try {
      await addApproval({
        distribution_id: distribution.id,
        level: currentLevel,
        approver_id: user.id,
        approver_name: user.email || "مستخدم",
        status,
        notes,
        approved_at: new Date().toISOString(),
      });
      
      setNotes("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLevelTitle = (level: number) => {
    switch (level) {
      case 1: return "مراجعة المحاسب";
      case 2: return "اعتماد المدير المالي";
      case 3: return "موافقة الناظر";
      default: return `المستوى ${level}`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "موافق": return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "مرفوض": return <XCircle className="h-5 w-5 text-destructive" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      "معلق": "secondary",
      "موافق": "default",
      "مرفوض": "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>مسار موافقات التوزيع - {distribution?.month}</DialogTitle>
          <DialogDescription>
            متابعة حالة الموافقات على التوزيع من المحاسب والمدير المالي والناظر
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* حالة التوزيع */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">حالة التوزيع</p>
                <p className="text-lg font-bold">{getStatusBadge(distribution?.status || "مسودة")}</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">المبلغ القابل للتوزيع</p>
                <p className="text-lg font-bold text-primary">
                  {distribution?.distributable_amount?.toLocaleString()} ريال
                </p>
              </div>
            </div>
          </Card>

          {/* مراحل الموافقة */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">مراحل الموافقة</h3>
            {[1, 2, 3].map((level) => {
              const approval = approvals.find((a) => a.level === level);
              const isActive = currentLevel === level;
              
              return (
                <Card 
                  key={level} 
                  className={`p-4 ${isActive && !allApproved && !isRejected ? 'border-primary' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {approval ? getStatusIcon(approval.status) : <User className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{getLevelTitle(level)}</h4>
                        {approval && getStatusBadge(approval.status)}
                      </div>
                      
                      {approval && (
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            الموافق: {approval.approver_name}
                          </p>
                          {approval.approved_at && (
                            <p className="text-muted-foreground">
                              التاريخ: {new Date(approval.approved_at).toLocaleDateString('ar-SA')}
                            </p>
                          )}
                          {approval.notes && (
                            <p className="text-foreground mt-2">
                              <span className="font-medium">ملاحظات:</span> {approval.notes}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {!approval && (
                        <p className="text-sm text-muted-foreground">
                          في انتظار الموافقة
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* نموذج الموافقة */}
          {canApprove() && (
            <Card className="p-4 bg-primary/5">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أضف ملاحظاتك هنا (اختياري)"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove("موافق")}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                    موافقة
                  </Button>
                  <Button
                    onClick={() => handleApprove("مرفوض")}
                    disabled={isSubmitting}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="ml-2 h-4 w-4" />
                    رفض
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* رسائل الحالة */}
          {allApproved && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-semibold">تم اعتماد التوزيع بنجاح من جميع المستويات</p>
              </div>
            </Card>
          )}
          
          {isRejected && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                <p className="font-semibold">تم رفض التوزيع</p>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
