/**
 * Rental Payments Hook - خطاف دفعات الإيجار
 * @version 2.8.30
 * 
 * تم تقسيم هذا الملف من 518 سطر إلى:
 * - RentalPaymentService (خدمة قاعدة البيانات)
 * - useRentalPaymentArchiving (أرشفة PDF)
 * - rental-payment-filters (فلاتر)
 * - useRentalPayments (هذا الملف - الـ hook الرئيسي)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { createMutationErrorHandler } from "@/lib/errors";
import { useEffect, useMemo } from "react";
import { logger } from "@/lib/logger";
import { RealtimeService } from "@/services/realtime.service";
import { RentalPaymentService, type RentalPayment } from "@/services/rental-payment.service";
import { useRentalPaymentArchiving } from "./useRentalPaymentArchiving";
import { filterRelevantPayments } from "@/lib/rental-payment-filters";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";
import type { RentalPaymentInsert } from "@/types/payments";

// Re-export RentalPayment type for backward compatibility
export type { RentalPayment } from "@/services/rental-payment.service";

// Re-export filter function for backward compatibility
export { filterRelevantPayments } from "@/lib/rental-payment-filters";

const RELATED_QUERY_KEYS = [
  QUERY_KEYS.RENTAL_PAYMENTS,
  QUERY_KEYS.RENTAL_PAYMENTS_COLLECTED,
  QUERY_KEYS.RENTAL_PAYMENTS_WITH_FREQUENCY,
  QUERY_KEYS.JOURNAL_ENTRIES
];

export const useRentalPayments = (
  contractId?: string, 
  showAllPayments: boolean = false, 
  daysThreshold: number = 90,
  showNextOnly: boolean = true
) => {
  const queryClient = useQueryClient();
  const { archiveInvoiceAndReceipt } = useRentalPaymentArchiving();

  // Real-time subscription using RealtimeService
  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable('rental_payments', () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RENTAL_PAYMENTS });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Fetch payments using service
  const { data: allPayments = [], isLoading } = useQuery({
    queryKey: contractId ? QUERY_KEYS.RENTAL_PAYMENTS_BY_CONTRACT(contractId) : QUERY_KEYS.RENTAL_PAYMENTS,
    queryFn: () => RentalPaymentService.getAll({ contractId }),
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });

  // Apply filtering logic
  const payments = useMemo(
    () => allPayments ? filterRelevantPayments(allPayments) : [],
    [allPayments]
  );

  const hiddenPaymentsCount = useMemo(
    () => (allPayments?.length || 0) - (payments?.length || 0),
    [allPayments, payments]
  );

  // Invalidate all related queries
  const invalidateRelatedQueries = () => {
    RELATED_QUERY_KEYS.forEach(key => 
      queryClient.invalidateQueries({ queryKey: [key] })
    );
  };

  // Add payment mutation
  const addPayment = useMutation({
    mutationKey: ['add_rental_payment'],
    mutationFn: async (payment: Omit<RentalPaymentInsert, 'payment_number'>) => {
      const data = await RentalPaymentService.create(payment);

      // إصدار فاتورة وسند قبض تلقائياً إذا تم الدفع
      if (data && data.amount_paid > 0 && data.payment_date) {
        await processInvoiceAndReceipt(data, payment.payment_method);
      }

      return data;
    },
    onSuccess: () => {
      invalidateRelatedQueries();
      toast({
        title: "تم إضافة الدفعة",
        description: "تم إضافة الدفعة وإنشاء القيد المحاسبي",
      });
    },
    onError: createMutationErrorHandler({ context: 'add_rental_payment' }),
  });

  // Update payment mutation
  const updatePayment = useMutation({
    mutationKey: ['update_rental_payment'],
    mutationFn: async ({ id, ...payment }: Partial<RentalPayment> & { id: string }) => {
      const oldData = await RentalPaymentService.getOldData(id);
      const data = await RentalPaymentService.update(id, payment);

      // إصدار فاتورة وسند قبض إذا تم الدفع لأول مرة
      const isNewPayment = oldData && oldData.amount_paid === 0 && data.amount_paid > 0;
      const hasNoInvoice = !oldData?.invoice_id && !oldData?.receipt_id;

      if (data && isNewPayment && hasNoInvoice && data.payment_date) {
        await processInvoiceAndReceipt(data, payment.payment_method);
      }

      return data;
    },
    onSuccess: () => {
      invalidateRelatedQueries();
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

  // Delete payment mutation
  const deletePayment = useMutation({
    mutationKey: ['delete_rental_payment'],
    mutationFn: RentalPaymentService.delete,
    onSuccess: () => {
      invalidateRelatedQueries();
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

  // Process invoice and receipt creation + archiving
  const processInvoiceAndReceipt = async (
    data: RentalPayment, 
    paymentMethod?: string
  ) => {
    try {
      const result = await RentalPaymentService.createInvoiceAndReceipt({
        rentalPaymentId: data.id,
        contractId: data.contract_id,
        amount: data.amount_paid,
        paymentDate: data.payment_date!,
        paymentMethod: paymentMethod || 'نقدي',
        tenantName: data.contracts?.tenant_name,
        tenantId: data.contracts?.tenant_id_number,
        tenantEmail: data.contracts?.tenant_email,
        tenantPhone: data.contracts?.tenant_phone,
        propertyName: data.contracts?.properties?.name
      });

      if (result.success && result.invoice_id && result.receipt_id) {
        logger.info('تم إصدار الفاتورة وسند القبض بنجاح', { 
          context: 'rental_invoice_receipt_created',
          metadata: { invoice_id: result.invoice_id, receipt_id: result.receipt_id }
        });

        // Archive documents
        await archiveInvoiceAndReceipt({
          invoiceId: result.invoice_id,
          receiptId: result.receipt_id,
          tenantName: data.contracts?.tenant_name
        });
      }
    } catch (error) {
      logger.error(error, { context: 'rental_invoice_generation', severity: 'high' });
      toast({
        title: "تحذير",
        description: "تم تسجيل الدفعة لكن فشل إصدار الفاتورة وسند القبض",
        variant: "destructive",
      });
    }
  };

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
