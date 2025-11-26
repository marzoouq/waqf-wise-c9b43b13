import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ApprovalStatus {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  current_level: number;
  total_levels: number;
  started_at: string;
  completed_at: string | null;
  approval_steps: Array<{
    level: number;
    approver_role: string;
    approver_name: string | null;
    action: string | null;
    actioned_at: string | null;
    notes: string | null;
  }>;
}

export function ApprovalWorkflowManager() {
  const { data: pendingApprovals, isLoading } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approval_status")
        .select(`
          *,
          approval_steps (*)
        `)
        .eq("status", "pending")
        .order("started_at", { ascending: false });
      
      if (error) throw error;
      return data as ApprovalStatus[];
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: "قيد المراجعة", variant: "secondary" as const, icon: Clock, className: "" },
      approved: { label: "موافق عليه", variant: "default" as const, icon: CheckCircle, className: "bg-success/10 text-success" },
      rejected: { label: "مرفوض", variant: "destructive" as const, icon: XCircle, className: "" },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">مسارات الموافقات</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {pendingApprovals?.length || 0} طلب معلق
        </Badge>
      </div>

      {pendingApprovals?.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد موافقات معلقة</h3>
          <p className="text-muted-foreground">جميع الطلبات تمت معالجتها</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingApprovals?.map((approval) => (
            <Card key={approval.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {approval.entity_type === "journal_entry" 
                          ? `قيد محاسبي - ${approval.entity_id}`
                          : approval.entity_type}
                      </h3>
                      {getStatusBadge(approval.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        المستوى الحالي: <span className="font-semibold text-foreground">
                          {approval.current_level} من {approval.total_levels}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        تاريخ البدء: <span className="font-medium text-foreground">
                          {new Date(approval.started_at).toLocaleDateString("ar-SA")}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* مسار الموافقة */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    مسار الموافقة
                  </h4>
                  <div className="space-y-2">
                    {approval.approval_steps
                      .sort((a, b) => (a.level || 0) - (b.level || 0))
                      .map((step, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-2 rounded ${
                            step.action
                              ? "bg-muted/50"
                              : (approval.current_level || 0) === (step.level || 0)
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-background"
                          }`}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border">
                            {step.action === "approved" ? (
                              <CheckCircle className="h-5 w-5 text-success" />
                            ) : step.action === "rejected" ? (
                              <XCircle className="h-5 w-5 text-destructive" />
                            ) : (
                              <span className="text-sm font-semibold">{step.level}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{step.approver_role}</p>
                            {step.approver_name && (
                              <p className="text-xs text-muted-foreground">{step.approver_name}</p>
                            )}
                          </div>
                          {step.actioned_at && (
                            <div className="text-left">
                              <p className="text-xs text-muted-foreground">
                                {new Date(step.actioned_at).toLocaleDateString("ar-SA")}
                              </p>
                              {step.notes && (
                                <p className="text-xs text-muted-foreground">{step.notes}</p>
                              )}
                            </div>
                          )}
                          {!step.action && (approval.current_level || 0) === (step.level || 0) && (
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-success hover:bg-success/90">
                                <CheckCircle className="ml-2 h-4 w-4" />
                                موافقة
                              </Button>
                              <Button size="sm" variant="destructive">
                                <XCircle className="ml-2 h-4 w-4" />
                                رفض
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
