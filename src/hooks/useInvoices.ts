import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJournalEntries } from "./useJournalEntries";
import { useEffect } from "react";

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
    const channel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["invoices"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
    staleTime: 3 * 60 * 1000,
  });

  const addInvoice = useMutation({
    mutationFn: async (invoiceData: any) => {
      // إنشاء الفاتورة
      const { data: invoiceRecord, error: invoiceError } = await supabase
        .from("invoices")
        .insert([invoiceData.invoice])
        .select()
        .maybeSingle();

      if (invoiceError) throw invoiceError;
      if (!invoiceRecord) throw new Error("فشل في إنشاء الفاتورة");

      // إضافة بنود الفاتورة
      if (invoiceData.lines && invoiceData.lines.length > 0) {
        const linesWithInvoiceId = invoiceData.lines.map((line: any) => ({
          ...line,
          invoice_id: invoiceRecord.id,
        }));

        const { error: linesError } = await supabase
          .from("invoice_lines")
          .insert(linesWithInvoiceId);

        if (linesError) throw linesError;
      }

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
          console.error("Error creating journal entry:", journalError);
        }
      }

      return invoiceRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast({
        title: "تم إنشاء الفاتورة بنجاح",
        description: "تم إنشاء الفاتورة والقيد المحاسبي",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإنشاء",
        description: error.message || "حدث خطأ أثناء إنشاء الفاتورة",
        variant: "destructive",
      });
    },
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
      const { data: oldInvoice } = await supabase
        .from("invoices")
        .select("status, total_amount")
        .eq("id", id)
        .maybeSingle();

      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .update(invoice)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (invoiceError) throw invoiceError;
      if (!invoiceData) throw new Error("فشل في تحديث الفاتورة");

      // إذا تم تحديث البنود
      if (lines && lines.length > 0) {
        // حذف البنود القديمة
        await supabase
          .from("invoice_lines")
          .delete()
          .eq("invoice_id", id);

        // إضافة البنود الجديدة
        const linesWithInvoiceId = lines.map((line) => ({
          ...line,
          invoice_id: id,
        }));

        const { error: linesError } = await supabase
          .from("invoice_lines")
          .insert(linesWithInvoiceId);

        if (linesError) throw linesError;
      }

      // إنشاء قيد محاسبي عند تحويل من مسودة إلى مرسلة
      if (oldInvoice?.status === "draft" && 
          (invoiceData.status === "sent" || invoiceData.status === "paid") &&
          !invoiceData.journal_entry_id) {
        try {
          const entryId = await createAutoEntry(
            "invoice_issued",
            invoiceData.id,
            invoiceData.total_amount,
            `فاتورة رقم ${invoiceData.invoice_number} - ${invoiceData.customer_name}`,
            invoiceData.invoice_date
          );

          // تحديث رقم القيد في الفاتورة
          await supabase
            .from("invoices")
            .update({ journal_entry_id: entryId })
            .eq("id", id);
        } catch (journalError) {
          console.error("Error creating journal entry:", journalError);
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
          console.error("Error creating payment journal entry:", journalError);
        }
      }

      return invoiceData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث الفاتورة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    invoices,
    isLoading,
    addInvoice: addInvoice.mutateAsync,
    updateInvoice: updateInvoice.mutateAsync,
  };
}
