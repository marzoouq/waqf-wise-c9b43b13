import { useState } from "react";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";
import { JournalApproval } from "@/types/approvals";

interface ApproveJournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approval: JournalApproval | null;
}

export function ApproveJournalDialog({ open, onOpenChange, approval }: ApproveJournalDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!approval) return;
    
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('approvals')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq('id', approval.id);

      if (error) throw error;

      // تحديث حالة القيد إلى posted
      const { error: jeError } = await supabase
        .from('journal_entries')
        .update({
          status: 'posted',
          posted_at: new Date().toISOString(),
        })
        .eq('id', approval.journal_entry_id);

      if (jeError) throw jeError;

      toast({
        title: "تمت الموافقة",
        description: "تم الموافقة على القيد بنجاح وترحيله",
      });

      queryClient.invalidateQueries({ queryKey: ['pending_approvals'] });
      queryClient.invalidateQueries({ queryKey: ['recent_entries_accountant'] });
      queryClient.invalidateQueries({ queryKey: ['journal_entries'] });
      
      onOpenChange(false);
      setNotes("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء الموافقة";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!approval) return;
    
    if (!notes.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال سبب الرفض",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('approvals')
        .update({
          status: 'rejected',
          approved_at: new Date().toISOString(),
          notes: notes,
        })
        .eq('id', approval.id);

      if (error) throw error;

      // تحديث حالة القيد إلى cancelled
      const { error: jeError } = await supabase
        .from('journal_entries')
        .update({
          status: 'cancelled',
        })
        .eq('id', approval.journal_entry_id);

      if (jeError) throw jeError;

      toast({
        title: "تم الرفض",
        description: "تم رفض القيد بنجاح",
      });

      queryClient.invalidateQueries({ queryKey: ['pending_approvals'] });
      queryClient.invalidateQueries({ queryKey: ['recent_entries_accountant'] });
      queryClient.invalidateQueries({ queryKey: ['journal_entries'] });
      
      onOpenChange(false);
      setNotes("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء الرفض";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onClick={handleReject}
            disabled={isSubmitting}
          >
            <XCircle className="h-4 w-4 mr-2" />
            رفض
          </Button>
          <Button
            onClick={handleApprove}
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
