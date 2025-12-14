import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { createMutationErrorHandler } from "@/lib/errors";
import type { InvoiceWithLines, InvoiceLineInsert } from "@/types/invoices";
import { InvoiceService } from "@/services/invoice.service";
import { RealtimeService } from "@/services/realtime.service";
import { QUERY_KEYS } from "@/lib/query-keys";
export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_time?: string;
  due_date?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_vat_number?: string;
  customer_commercial_registration?: string;
  subtotal: number;
  tax_amount: number;
  tax_rate?: number;
  total_amount: number;
  status: string;
  notes?: string;
  qr_code_data?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLine {
  id?: string;
  invoice_id?: string;
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
  account_id?: string;
}

export function useInvoices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createAutoEntry } = useJournalEntries();

  // Real-time subscription
  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable('invoices', () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVOICES });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const { data: invoices = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.INVOICES,
    queryFn: () => InvoiceService.getAll(),
    staleTime: 3 * 60 * 1000,
  });

  const addInvoice = useMutation({
    mutationFn: async (invoiceData: InvoiceWithLines) => {
      const invoiceRecord = await InvoiceService.create(
        invoiceData.invoice,
        invoiceData.lines?.map(line => ({
          ...line,
          invoice_id: '', // سيتم تحديثه في الخدمة
        }))
      );

      // إنشاء قيد محاسبي تلقائي عند إصدار الفاتورة
      if (invoiceRecord.status === "sent" || invoiceRecord.status === "paid") {
        try {
          await createAutoEntry(
            "invoice_issued",
            invoiceRecord.id,
            invoiceRecord.total_amount,
            `فاتورة رقم ${invoiceRecord.invoice_number} - ${invoiceRecord.customer_name}`,
            invoiceRecord.invoice_date
          );
        } catch (journalError) {
          logger.error(journalError, { context: 'invoice_journal_entry', severity: 'medium' });
        }
      }

      return invoiceRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVOICES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL_ENTRIES });
      toast({
        title: "تم إنشاء الفاتورة بنجاح",
        description: "تم إنشاء الفاتورة والقيد المحاسبي",
      });
    },
    onError: createMutationErrorHandler({
      context: 'add_invoice',
      toastTitle: 'خطأ في الإنشاء',
    }),
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ 
      id, 
      invoice, 
      lines 
    }: { 
      id: string; 
      invoice: Partial<Invoice>;
      lines?: InvoiceLine[];
    }) => {
      const oldInvoice = await InvoiceService.getById(id);
      const invoiceData = await InvoiceService.update(
        id, 
        invoice, 
        lines?.map(line => ({
          ...line,
          invoice_id: id,
        }))
      );

      // إنشاء قيد محاسبي عند تحويل من مسودة إلى مرسلة
      if (oldInvoice?.status === "draft" && 
          (invoiceData.status === "sent" || invoiceData.status === "paid") &&
          !invoiceData.journal_entry_id) {
        try {
          await createAutoEntry(
            "invoice_issued",
            invoiceData.id,
            invoiceData.total_amount,
            `فاتورة رقم ${invoiceData.invoice_number} - ${invoiceData.customer_name}`,
            invoiceData.invoice_date
          );
        } catch (journalError) {
          logger.error(journalError, { context: 'update_invoice_journal_entry', severity: 'medium' });
        }
      }

      // إنشاء قيد تحصيل عند تحويل إلى مدفوعة
      if (oldInvoice?.status !== "paid" && invoiceData.status === "paid") {
        try {
          await createAutoEntry(
            "invoice_paid",
            invoiceData.id,
            invoiceData.total_amount,
            `تحصيل فاتورة رقم ${invoiceData.invoice_number} - ${invoiceData.customer_name}`,
            new Date().toISOString().split('T')[0]
          );
        } catch (journalError) {
          logger.error(journalError, { context: 'invoice_payment_journal_entry', severity: 'medium' });
        }
      }

      return invoiceData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVOICES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL_ENTRIES });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث الفاتورة بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'add_invoice',
      toastTitle: 'خطأ في الإنشاء',
    }),
  });

  const deleteInvoice = useMutation({
    mutationFn: (invoiceId: string) => InvoiceService.delete(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVOICES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL_ENTRIES });
      toast({
        title: "تم حذف الفاتورة بنجاح",
        description: "تم حذف الفاتورة والقيد المحاسبي المرتبط بها",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في الحذف",
        description: error.message,
      });
    }
  });

  return {
    invoices,
    isLoading,
    error,
    refetch,
    addInvoice: addInvoice.mutateAsync,
    updateInvoice: updateInvoice.mutateAsync,
    deleteInvoice: deleteInvoice.mutateAsync,
  };
}
