import { useState } from "react";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";
import { JournalApproval } from "@/types/approvals";
import { useApproveJournal } from "@/hooks/accounting";

interface ApproveJournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approval: JournalApproval | null;
}

export function ApproveJournalDialog({ open, onOpenChange, approval }: ApproveJournalDialogProps) {
  const [notes, setNotes] = useState("");
  
  const { isSubmitting, handleApprove, handleReject } = useApproveJournal(() => {
    onOpenChange(false);
    setNotes("");
  });

  if (!approval) return null;

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="موافقة على القيد المحاسبي"
      description={`قيد رقم: ${approval.journal_entry?.entry_number || 'غير محدد'}`}
      size="md"
    >
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">التاريخ:</span>
            <span className="font-medium">{approval.journal_entry?.entry_date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">الوصف:</span>
            <span className="font-medium">{approval.journal_entry?.description}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">مقدم الطلب:</span>
            <span className="font-medium">{approval.approver_name}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">ملاحظات</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أدخل ملاحظاتك (اختياري للموافقة، إلزامي للرفض)..."
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleReject(approval, notes)}
            disabled={isSubmitting}
          >
            <XCircle className="h-4 w-4 mr-2" />
            رفض
          </Button>
          <Button
            onClick={() => handleApprove(approval, notes)}
            disabled={isSubmitting}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isSubmitting ? "جاري المعالجة..." : "موافقة"}
          </Button>
        </DialogFooter>
      </div>
    </ResponsiveDialog>
  );
}
