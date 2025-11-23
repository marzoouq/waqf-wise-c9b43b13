import { useState } from "react";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle } from "lucide-react";
import { useApprovals } from "@/hooks/useApprovals";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  journalEntryId: string;
  entryNumber: string;
};

const ApprovalDialog = ({ open, onOpenChange, journalEntryId, entryNumber }: Props) => {
  const { addApproval } = useApprovals();
  const [approverName, setApproverName] = useState("");
  const [notes, setNotes] = useState("");

  const handleApprove = async (status: "approved" | "rejected") => {
    await addApproval.mutateAsync({
      journal_entry_id: journalEntryId,
      approver_name: approverName,
      status,
      notes,
    });
    onOpenChange(false);
    setApproverName("");
    setNotes("");
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="الموافقة على القيد المحاسبي"
      size="md"
    >

        <div className="space-y-4">
          <div className="p-4 bg-accent/20 rounded-lg">
            <div className="text-sm text-muted-foreground">رقم القيد</div>
            <div className="font-mono font-semibold">{entryNumber}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="approver">اسم الموافق *</Label>
            <Input
              id="approver"
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              placeholder="أدخل اسم الموافق"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف ملاحظات (اختياري)"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={addApproval.isPending}
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleApprove("rejected")}
            disabled={!approverName || addApproval.isPending}
          >
            <XCircle className="h-4 w-4 ml-2" />
            رفض
          </Button>
          <Button
            onClick={() => handleApprove("approved")}
            disabled={!approverName || addApproval.isPending}
          >
            <CheckCircle className="h-4 w-4 ml-2" />
            موافقة
          </Button>
        </DialogFooter>
    </ResponsiveDialog>
  );
};

export default ApprovalDialog;
