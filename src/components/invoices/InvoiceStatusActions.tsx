import { Button } from "@/components/ui/button";
import { useInvoices } from "@/hooks/useInvoices";
import { toast } from "sonner";
import { CheckCircle, Send, XCircle } from "lucide-react";

interface InvoiceStatusActionsProps {
  invoice: {
    id: string;
    status: string;
    invoice_number: string;
  };
  onStatusChanged?: () => void;
}

export const InvoiceStatusActions = ({ invoice, onStatusChanged }: InvoiceStatusActionsProps) => {
  const { updateInvoice } = useInvoices();

  const handleIssue = async () => {
    try {
      await updateInvoice({
        id: invoice.id,
        invoice: { status: "sent" }
      });
      toast.success("تم إصدار الفاتورة");
      onStatusChanged?.();
    } catch (error) {
      toast.error("فشل في إصدار الفاتورة");
    }
  };

  const handleMarkPaid = async () => {
    try {
      await updateInvoice({
        id: invoice.id,
        invoice: { status: "paid" }
      });
      toast.success("تم تسجيل الدفع");
      onStatusChanged?.();
    } catch (error) {
      toast.error("فشل في تسجيل الدفع");
    }
  };

  const handleCancel = async () => {
    try {
      await updateInvoice({
        id: invoice.id,
        invoice: { status: "cancelled" }
      });
      toast.warning("تم إلغاء الفاتورة");
      onStatusChanged?.();
    } catch (error) {
      toast.error("فشل في إلغاء الفاتورة");
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {invoice.status === "draft" && (
        <Button size="sm" onClick={handleIssue}>
          <Send className="h-4 w-4 ml-2" />
          إصدار الفاتورة
        </Button>
      )}
      {invoice.status === "sent" && (
        <Button size="sm" variant="default" onClick={handleMarkPaid}>
          <CheckCircle className="h-4 w-4 ml-2" />
          تسجيل الدفع
        </Button>
      )}
      {(invoice.status === "draft" || invoice.status === "sent") && (
        <Button size="sm" variant="destructive" onClick={handleCancel}>
          <XCircle className="h-4 w-4 ml-2" />
          إلغاء
        </Button>
      )}
    </div>
  );
};
