import { Button } from "@/components/ui/button";
import { useInvoices } from "@/hooks/payments/useInvoices";
import { toast } from "sonner";
import { CheckCircle, Send, XCircle, Lock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { createOptimisticStatusChange } from "@/lib/query-keys/optimistic";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const { hasPermission, hasAnyPermission, isLoading: permissionsLoading } = usePermissions();

  // ✅ فحص الصلاحيات
  const canUpdateInvoiceStatus = hasAnyPermission([
    'invoices.update_status',
    'invoices.manage',
    'payments.manage',
    'accounting.manage',
  ]);

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
    if (!canUpdateInvoiceStatus) {
      toast.error('ليس لديك صلاحية لإصدار الفاتورة');
      return;
    }
    statusMutation.mutate({ id: invoice.id, status: "sent" });
  };

  const handleMarkPaid = () => {
    if (!canUpdateInvoiceStatus) {
      toast.error('ليس لديك صلاحية لتسجيل الدفع');
      return;
    }
    statusMutation.mutate({ id: invoice.id, status: "paid" });
  };

  const handleCancel = () => {
    if (!canUpdateInvoiceStatus) {
      toast.error('ليس لديك صلاحية لإلغاء الفاتورة');
      return;
    }
    statusMutation.mutate({ id: invoice.id, status: "cancelled" });
  };

  // عرض رسالة عدم الصلاحية
  if (!permissionsLoading && !canUpdateInvoiceStatus) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Lock className="h-4 w-4" />
              <span>لا توجد صلاحية</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>ليس لديك صلاحية لتحديث حالة الفاتورة</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {invoice.status === "draft" && (
        <Button 
          size="sm" 
          onClick={handleIssue} 
          disabled={statusMutation.isPending || permissionsLoading}
        >
          <Send className="h-4 w-4 ms-2" />
          إصدار الفاتورة
        </Button>
      )}
      {invoice.status === "sent" && (
        <Button 
          size="sm" 
          variant="default" 
          onClick={handleMarkPaid} 
          disabled={statusMutation.isPending || permissionsLoading}
        >
          <CheckCircle className="h-4 w-4 ms-2" />
          تسجيل الدفع
        </Button>
      )}
      {(invoice.status === "draft" || invoice.status === "sent") && (
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={handleCancel} 
          disabled={statusMutation.isPending || permissionsLoading}
        >
          <XCircle className="h-4 w-4 ms-2" />
          إلغاء
        </Button>
      )}
    </div>
  );
};
