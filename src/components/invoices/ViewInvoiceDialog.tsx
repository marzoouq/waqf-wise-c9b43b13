import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import EnhancedInvoiceView from "./EnhancedInvoiceView";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";

interface ViewInvoiceDialogProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewInvoiceDialog = ({ invoiceId, open, onOpenChange }: ViewInvoiceDialogProps) => {
  const { settings: orgSettings } = useOrganizationSettings();
  
  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!invoiceId,
  });

  const { data: invoiceLines, isLoading: linesLoading } = useQuery({
    queryKey: ["invoice-lines", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];
      const { data, error } = await supabase
        .from("invoice_lines")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("line_number");
      if (error) throw error;
      return data;
    },
    enabled: !!invoiceId,
  });

  const handlePrint = () => window.print();
  const handleDownloadPDF = async () => {
    if (invoice && invoiceLines) {
      await generateInvoicePDF(invoice, invoiceLines, orgSettings);
    }
  };

  if (invoiceLoading || linesLoading) {
    return (
      <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="تفاصيل الفاتورة" size="xl">
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ResponsiveDialog>
    );
  }

  if (!invoice) return null;

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="تفاصيل الفاتورة" size="xl">
      <div className="space-y-4">
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 ml-2" />
            تصدير PDF
          </Button>
        </div>
        <EnhancedInvoiceView invoice={invoice} lines={invoiceLines || []} orgSettings={orgSettings} />
      </div>
    </ResponsiveDialog>
  );
};
