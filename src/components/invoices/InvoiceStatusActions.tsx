import { Button } from "@/components/ui/button";
import { useInvoices } from "@/hooks/payments/useInvoices";
import { toast } from "sonner";
import { CheckCircle, Send, XCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { createOptimisticStatusChange } from "@/lib/query-keys/optimistic";

interface Invoice {
  id: string;
  status: string;
  invoice_number: string;
}

interface InvoiceStatusActionsProps {
  invoice: Invoice;
  onStatusChanged?: () => void;
}

export const InvoiceStatusActions = ({ invoice, onStatusChanged }: InvoiceStatusActionsProps) => {
  const { updateInvoice } = useInvoices();
  const queryClient = useQueryClient();

  // ✅ Optimistic Update للحالة
  const optimistic = createOptimisticStatusChange<Invoice>(
    queryClient,
    QUERY_KEYS.INVOICES,
    {
      successMessage: undefined, // سنستخدم toast مخصص
      rollbackMessage: 'فشل تحديث الحالة - تم التراجع',
    }
  );

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await updateInvoice({ id, invoice: { status } });
      return { id, status };
    },
    onMutate: async (variables) => {
      return await optimistic.onMutate(variables);
    },
    onError: (error, variables, context) => {
      optimistic.onError(error as Error, variables, context);
    },
    onSuccess: (_, variables) => {
      const messages: Record<string, string> = {
        sent: "تم إصدار الفاتورة",
        paid: "تم تسجيل الدفع",
        cancelled: "تم إلغاء الفاتورة",
      };
      toast.success(messages[variables.status] || "تم تحديث الحالة");
      onStatusChanged?.();
    },
    onSettled: () => {
      optimistic.onSettled();
    },
  });

  const handleIssue = () => {
    statusMutation.mutate({ id: invoice.id, status: "sent" });
  };

  const handleMarkPaid = () => {
    statusMutation.mutate({ id: invoice.id, status: "paid" });
  };

  const handleCancel = () => {
    statusMutation.mutate({ id: invoice.id, status: "cancelled" });
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {invoice.status === "draft" && (
        <Button size="sm" onClick={handleIssue} disabled={statusMutation.isPending}>
          <Send className="h-4 w-4 ms-2" />
          إصدار الفاتورة
        </Button>
      )}
      {invoice.status === "sent" && (
        <Button size="sm" variant="default" onClick={handleMarkPaid} disabled={statusMutation.isPending}>
          <CheckCircle className="h-4 w-4 ms-2" />
          تسجيل الدفع
        </Button>
      )}
      {(invoice.status === "draft" || invoice.status === "sent") && (
        <Button size="sm" variant="destructive" onClick={handleCancel} disabled={statusMutation.isPending}>
          <XCircle className="h-4 w-4 ms-2" />
          إلغاء
        </Button>
      )}
    </div>
  );
};
