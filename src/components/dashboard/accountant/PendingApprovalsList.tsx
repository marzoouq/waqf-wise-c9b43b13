/**
 * PendingApprovalsList Component
 * قائمة الموافقات المعلقة للمحاسب
 */

import { Button } from "@/components/ui/button";
import { FileText, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { JournalApproval } from "@/types/approvals";

interface PendingApprovalsListProps {
  approvals: JournalApproval[];
  onReview: (approval: JournalApproval) => void;
}

export function PendingApprovalsList({ approvals, onReview }: PendingApprovalsListProps) {
  if (approvals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success" />
        <p>لا توجد موافقات معلقة</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {approvals.map((approval) => (
        <div
          key={approval.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">
                {approval.journal_entry?.entry_number || 'قيد محاسبي'}
              </p>
              <StatusBadge status={approval.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {approval.journal_entry?.description || 'لا يوجد وصف'}
            </p>
            <p className="text-xs text-muted-foreground">
              المراجع: {approval.approver_name}
            </p>
          </div>
          <Button size="sm" onClick={() => onReview(approval)}>
            مراجعة
          </Button>
        </div>
      ))}
    </div>
  );
}
