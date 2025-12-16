/**
 * Hook for approving/rejecting journal entries
 */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { useToast } from "@/hooks/ui/use-toast";
import { JournalApproval } from "@/types/approvals";
import { invalidateAccountingQueries } from "@/lib/query-invalidation";

export function useApproveJournal(onSuccess?: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async (approval: JournalApproval, notes: string) => {
    try {
      setIsSubmitting(true);

      await AccountingService.approveJournalApproval(approval.id, notes);
      await AccountingService.updateJournalEntryStatus(approval.journal_entry_id, 'posted');

      toast({
        title: "تمت الموافقة",
        description: "تم الموافقة على القيد بنجاح وترحيله",
      });

      // ✅ استدعاء واحد بدلاً من 5
      invalidateAccountingQueries(queryClient);
      
      onSuccess?.();
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

  const handleReject = async (approval: JournalApproval, notes: string) => {
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

      await AccountingService.rejectJournalApproval(approval.id, notes);
      await AccountingService.updateJournalEntryStatus(approval.journal_entry_id, 'cancelled');

      toast({
        title: "تم الرفض",
        description: "تم رفض القيد بنجاح",
      });

      // ✅ استدعاء واحد بدلاً من 5
      invalidateAccountingQueries(queryClient);
      
      onSuccess?.();
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

  return {
    isSubmitting,
    handleApprove,
    handleReject,
  };
}
