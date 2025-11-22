import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { createMutationErrorHandler } from "@/lib/errorHandling";
import type { RentalPaymentInsert, RentalPaymentUpdate } from "@/types/payments";
import { useJournalEntries } from "./useJournalEntries";
import { useEffect, useMemo } from "react";
import { logger } from "@/lib/logger";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { generateReceiptPDF } from "@/lib/generateReceiptPDF";
import { archiveDocument, pdfToBlob } from "@/lib/archiveDocument";

export interface RentalPayment {
  id: string;
  payment_number: string;
  contract_id: string;
  due_date: string;
  payment_date?: string;
  amount_due: number;
  amount_paid: number;
  status: string;
  payment_method?: string;
  late_fee: number;
  discount: number;
  receipt_number?: string;
  notes?: string;
  journal_entry_id?: string;
  invoice_id?: string;
  receipt_id?: string;
  created_at: string;
  updated_at: string;
  contracts?: {
    contract_number: string;
    tenant_name: string;
    tenant_id_number?: string;
    tenant_email?: string;
    tenant_phone?: string;
    properties: {
      name: string;
    };
  };
}

// Filter to show only relevant payments: paid, under collection, and overdue
export const filterRelevantPayments = (
  payments: RentalPayment[]
): RentalPayment[] => {
  const today = new Date();

  return payments.filter((payment) => {
    const dueDate = new Date(payment.due_date);
    
    // Always show paid payments
    if (payment.status === 'مدفوع' || payment.payment_date) {
      return true;
    }

    // Always show under collection payments
    if (payment.status === 'تحت التحصيل') {
      return true;
    }

    // Show overdue payments
    if (dueDate < today && payment.status !== 'مدفوع' && !payment.payment_date) {
      return true;
    }

    // Hide all other pending payments
    return false;
  });
};

// Filter to show only the next upcoming payment per contract
const filterNextPaymentPerContract = (payments: RentalPayment[]) => {
  const now = new Date();
  
  // Group payments by contract
  const paymentsByContract = payments.reduce((acc, payment) => {
    const contractId = payment.contract_id;
    if (!acc[contractId]) {
      acc[contractId] = [];
    }
    acc[contractId].push(payment);
    return acc;
  }, {} as Record<string, RentalPayment[]>);

  // For each contract, keep paid, overdue, and only the next upcoming payment
  const result: RentalPayment[] = [];
  
  Object.values(paymentsByContract).forEach((contractPayments) => {
    // Sort by due date
    const sorted = [...contractPayments].sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

    // Add paid payments
    const paid = sorted.filter(p => p.payment_date);
    result.push(...paid);

    // Add overdue payments
    const overdue = sorted.filter(p => !p.payment_date && new Date(p.due_date) < now);
    result.push(...overdue);

    // Find and add only the next upcoming payment
    const upcoming = sorted.filter(p => !p.payment_date && new Date(p.due_date) >= now);
    if (upcoming.length > 0) {
      result.push(upcoming[0]); // Only the closest upcoming payment
    }
  });

  return result;
};

export const useRentalPayments = (
  contractId?: string, 
  showAllPayments: boolean = false, 
  daysThreshold: number = 90,
  showNextOnly: boolean = true
) => {
  const queryClient = useQueryClient();
  const { createAutoEntry } = useJournalEntries();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('rental-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rental_payments'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["rental_payments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: allPayments, isLoading } = useQuery({
    queryKey: ["rental_payments", contractId || undefined],
    queryFn: async () => {
      let query = supabase
        .from("rental_payments")
        .select(`
          *,
          contracts(
            contract_number,
            tenant_name,
            properties(name)
          )
        `)
        .order("due_date", { ascending: false });

      if (contractId) {
        query = query.eq("contract_id", contractId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RentalPayment[];
    },
  });

  // Apply filtering logic - always show only paid, under collection, and overdue
  const payments = useMemo(
    () => {
      if (!allPayments) return [];
      return filterRelevantPayments(allPayments);
    },
    [allPayments]
  );

  const hiddenPaymentsCount = useMemo(
    () => {
      if (!allPayments || !payments) return 0;
      return allPayments.length - payments.length;
    },
    [allPayments, payments]
  );

  const addPayment = useMutation({
    mutationKey: ['add_rental_payment'],
    mutationFn: async (payment: Omit<RentalPaymentInsert, 'payment_number'>) => {
      const paymentNumber = `RP-${Date.now().toString().slice(-8)}`;
      const { data, error } = await supabase
        .from("rental_payments")
        .insert([{ ...payment, payment_number: paymentNumber }])
        .select(`
          *,
          contracts(
            contract_number,
            tenant_name,
            tenant_id_number,
            tenant_email,
            tenant_phone,
            properties(name)
          )
        `)
        .single();

      if (error) throw error;

      // إصدار فاتورة وسند قبض تلقائياً إذا تم الدفع
      if (data && data.amount_paid > 0 && data.payment_date) {
        try {
          const { data: result, error: rpcError } = await supabase.rpc(
            'create_rental_invoice_and_receipt',
            {
              p_rental_payment_id: data.id,
              p_contract_id: data.contract_id,
              p_amount: data.amount_paid,
              p_payment_date: data.payment_date,
              p_payment_method: payment.payment_method || 'نقدي',
              p_tenant_name: data.contracts?.tenant_name,
              p_tenant_id: data.contracts?.tenant_id_number,
              p_tenant_email: data.contracts?.tenant_email,
              p_tenant_phone: data.contracts?.tenant_phone,
              p_property_name: data.contracts?.properties?.name
            }
          );

          if (rpcError) {
            logger.error(rpcError, { context: 'create_rental_invoice_receipt', severity: 'high' });
            toast({
              title: "تحذير",
              description: "تم تسجيل الدفعة لكن فشل إصدار الفاتورة وسند القبض",
              variant: "destructive",
            });
          } else if (result && result.length > 0 && result[0].success) {
            const { invoice_id, receipt_id } = result[0];
            
            logger.info('تم إصدار الفاتورة وسند القبض بنجاح', { 
              context: 'rental_invoice_receipt_created',
              metadata: { invoice_id, receipt_id }
            });

            // توليد وأرشفة PDF للفاتورة وسند القبض
            try {
              // جلب بيانات الفاتورة الكاملة مع البنود
              const { data: invoiceData } = await supabase
                .from('invoices')
                .select('*, invoice_lines(*)')
                .eq('id', invoice_id)
                .single();

              // جلب بيانات سند القبض
              const { data: receiptData } = await supabase
                .from('payments')
                .select('*')
                .eq('id', receipt_id)
                .single();

              // جلب إعدادات المنظمة
              const { data: orgSettings } = await supabase
                .from('organization_settings')
                .select('*')
                .single();

              if (invoiceData && receiptData && orgSettings) {
                // توليد PDF الفاتورة (بدون حفظ)
                const jsPDF = (await import('jspdf')).default;
                const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                
                // استخدام دالة generateInvoicePDF لكن بدون save
                await generateInvoicePDF(invoiceData, invoiceData.invoice_lines || [], orgSettings as any);
                
                // توليد Blob من PDF
                const invoiceBlob = doc.output('blob');

                // أرشفة الفاتورة
                await archiveDocument({
                  fileBlob: invoiceBlob,
                  fileName: `Invoice-${invoiceData.invoice_number}.pdf`,
                  fileType: 'invoice',
                  referenceId: invoice_id,
                  referenceType: 'invoice',
                  description: `فاتورة ${invoiceData.invoice_number} - ${data.contracts?.tenant_name}`
                });

                // توليد PDF سند القبض (بدون حفظ)
                const receiptDoc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                await generateReceiptPDF(receiptData, orgSettings as any);
                const receiptBlob = receiptDoc.output('blob');

                // أرشفة سند القبض
                await archiveDocument({
                  fileBlob: receiptBlob,
                  fileName: `Receipt-${receiptData.payment_number}.pdf`,
                  fileType: 'receipt',
                  referenceId: receipt_id,
                  referenceType: 'payment',
                  description: `سند قبض ${receiptData.payment_number} - ${data.contracts?.tenant_name}`
                });

                logger.info('تم أرشفة الفاتورة وسند القبض بنجاح', {
                  context: 'archive_rental_documents',
                  metadata: { invoice_id, receipt_id }
                });
              }
            } catch (archiveError) {
              logger.error(archiveError, { context: 'archive_rental_documents', severity: 'medium' });
            }
          }
        } catch (invoiceError) {
          logger.error(invoiceError, { context: 'rental_invoice_generation', severity: 'high' });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental_payments"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast({
        title: "تم إضافة الدفعة",
        description: "تم إضافة الدفعة وإنشاء القيد المحاسبي",
      });
    },
    onError: createMutationErrorHandler({ context: 'add_rental_payment' }),
  });

  const updatePayment = useMutation({
    mutationKey: ['update_rental_payment'],
    mutationFn: async ({ id, ...payment }: Partial<RentalPayment> & { id: string }) => {
      // جلب البيانات القديمة
      const { data: oldData } = await supabase
        .from("rental_payments")
        .select("amount_paid, payment_date, invoice_id, receipt_id, contract_id")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("rental_payments")
        .update(payment)
        .eq("id", id)
        .select(`
          *,
          contracts(
            contract_number,
            tenant_name,
            tenant_id_number,
            tenant_email,
            tenant_phone,
            properties(name)
          )
        `)
        .single();

      if (error) throw error;

      // إصدار فاتورة وسند قبض إذا تم الدفع لأول مرة (ولم يتم إصدارهما من قبل)
      const isNewPayment = oldData && oldData.amount_paid === 0 && data.amount_paid > 0;
      const hasNoInvoice = !oldData?.invoice_id && !oldData?.receipt_id;

      if (data && isNewPayment && hasNoInvoice && data.payment_date) {
        try {
          const { data: result, error: rpcError } = await supabase.rpc(
            'create_rental_invoice_and_receipt',
            {
              p_rental_payment_id: data.id,
              p_contract_id: data.contract_id,
              p_amount: data.amount_paid,
              p_payment_date: data.payment_date,
              p_payment_method: payment.payment_method || 'نقدي',
              p_tenant_name: data.contracts?.tenant_name,
              p_tenant_id: data.contracts?.tenant_id_number,
              p_tenant_email: data.contracts?.tenant_email,
              p_tenant_phone: data.contracts?.tenant_phone,
              p_property_name: data.contracts?.properties?.name
            }
          );

          if (rpcError) {
            logger.error(rpcError, { context: 'update_rental_invoice_receipt', severity: 'high' });
            toast({
              title: "تحذير",
              description: "تم تحديث الدفعة لكن فشل إصدار الفاتورة وسند القبض",
              variant: "destructive",
            });
          } else if (result && result.length > 0 && result[0].success) {
            const { invoice_id, receipt_id } = result[0];
            
            logger.info('تم إصدار الفاتورة وسند القبض بنجاح', { 
              context: 'update_rental_invoice_receipt_created',
              metadata: { invoice_id, receipt_id }
            });

            // توليد وأرشفة PDF
            try {
              const { data: invoiceData } = await supabase
                .from('invoices')
                .select('*, invoice_lines(*)')
                .eq('id', invoice_id)
                .single();

              const { data: receiptData } = await supabase
                .from('payments')
                .select('*')
                .eq('id', receipt_id)
                .single();

              const { data: orgSettings } = await supabase
                .from('organization_settings')
                .select('*')
                .single();

              if (invoiceData && receiptData && orgSettings) {
                const jsPDF = (await import('jspdf')).default;
                const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                
                await generateInvoicePDF(invoiceData, invoiceData.invoice_lines || [], orgSettings as any);
                const invoiceBlob = doc.output('blob');

                await archiveDocument({
                  fileBlob: invoiceBlob,
                  fileName: `Invoice-${invoiceData.invoice_number}.pdf`,
                  fileType: 'invoice',
                  referenceId: invoice_id,
                  referenceType: 'invoice',
                  description: `فاتورة ${invoiceData.invoice_number} - ${data.contracts?.tenant_name}`
                });

                const receiptDoc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                await generateReceiptPDF(receiptData, orgSettings as any);
                const receiptBlob = receiptDoc.output('blob');

                await archiveDocument({
                  fileBlob: receiptBlob,
                  fileName: `Receipt-${receiptData.payment_number}.pdf`,
                  fileType: 'receipt',
                  referenceId: receipt_id,
                  referenceType: 'payment',
                  description: `سند قبض ${receiptData.payment_number} - ${data.contracts?.tenant_name}`
                });

                logger.info('تم أرشفة الفاتورة وسند القبض بنجاح');
              }
            } catch (archiveError) {
              logger.error(archiveError, { context: 'update_archive_rental_documents', severity: 'medium' });
            }
          }
        } catch (invoiceError) {
          logger.error(invoiceError, { context: 'update_rental_invoice_generation', severity: 'high' });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental_payments"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast({
        title: "تم تحديث الدفعة",
        description: "تم تحديث الدفعة والقيد المحاسبي",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الدفعة",
        variant: "destructive",
      });
      logger.error(error, { context: 'update_rental_payment', severity: 'medium' });
    },
  });

  const deletePayment = useMutation({
    mutationKey: ['delete_rental_payment'],
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from("rental_payments")
        .delete()
        .eq("id", paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental_payments"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الدفعة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الدفعة",
        variant: "destructive",
      });
      logger.error(error, { context: 'delete_rental_payment', severity: 'medium' });
    },
  });

  return {
    payments,
    allPayments,
    hiddenPaymentsCount,
    isLoading,
    addPayment,
    updatePayment,
    deletePayment,
  };
};