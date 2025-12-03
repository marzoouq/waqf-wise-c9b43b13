import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "@/lib/toast";
import { usePayments } from "@/hooks/usePayments";
import { supabase } from "@/integrations/supabase/client";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { PaymentDialog } from "@/components/payments/PaymentDialog";
import { PaymentsHeader } from "@/components/payments/PaymentsHeader";
import { PaymentsStats } from "@/components/payments/PaymentsStats";
import { PaymentsFilters } from "@/components/payments/PaymentsFilters";
import { PaymentsTable } from "@/components/payments/PaymentsTable";
import { PaymentReceiptTemplate } from "@/components/payments/PaymentReceiptTemplate";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { logger } from "@/lib/logger";
import { Database } from '@/integrations/supabase/types';
import { toPaymentReceipt } from '@/types/payment-receipt.types';

type Payment = Database['public']['Tables']['payments']['Row'];

interface PaymentWithContract extends Payment {
  contract_number?: string;
  tenant_name?: string;
  property_name?: string;
}

const ITEMS_PER_PAGE = 20;

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [printPayment, setPrintPayment] = useState<Payment | null>(null);
  const [paymentsWithContracts, setPaymentsWithContracts] = useState<PaymentWithContract[]>([]);

  const { payments, isLoading, addPayment, updatePayment, deletePayment } = usePayments();

  // جلب معلومات العقود مع السندات
  useEffect(() => {
    const fetchPaymentsWithContracts = async () => {
      const { data, error } = await supabase
        .from("payments_with_contract_details")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPaymentsWithContracts(data as PaymentWithContract[]);
      } else {
        setPaymentsWithContracts(payments as PaymentWithContract[]);
      }
    };

    if (payments.length > 0) {
      fetchPaymentsWithContracts();
    }
  }, [payments]);

  // Memoize filtered payments
  const filteredPayments = useMemo(() => {
    if (!searchQuery) return paymentsWithContracts;

    const query = searchQuery.toLowerCase();
    return paymentsWithContracts.filter(
      (p) =>
        p.payment_number.toLowerCase().includes(query) ||
        p.payer_name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.contract_number && p.contract_number.toLowerCase().includes(query)) ||
        (p.tenant_name && p.tenant_name.toLowerCase().includes(query)) ||
        (p.property_name && p.property_name.toLowerCase().includes(query))
    );
  }, [paymentsWithContracts, searchQuery]);

  // Paginate filtered results
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPayments.slice(startIndex, endIndex);
  }, [filteredPayments, currentPage]);

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);

  // حساب الإحصائيات
  const receipts = payments.filter((p) => p.payment_type === "receipt");
  const paymentsOut = payments.filter((p) => p.payment_type === "payment");
  const totalReceipts = receipts.length;
  const totalVouchers = paymentsOut.length;
  const totalReceiptsAmount = receipts.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalVouchersAmount = paymentsOut.reduce((sum, p) => sum + Number(p.amount), 0);


  const handleAddPayment = useCallback(() => {
    setSelectedPayment(null);
    setDialogOpen(true);
  }, []);

  const handleEditPayment = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  }, []);

  const handleSavePayment = async (data: Record<string, unknown>) => {
    try {
      if (selectedPayment) {
        await updatePayment({ id: selectedPayment.id, ...data } as Parameters<typeof updatePayment>[0]);
        toast({ title: "تم تحديث السند بنجاح", variant: "default" });
      } else {
        await addPayment(data as Parameters<typeof addPayment>[0]);
        toast({ title: "تم إضافة السند بنجاح", variant: "default" });
      }
      setDialogOpen(false);
    } catch (error) {
      logger.error(error, { context: 'save_payment', severity: 'medium' });
      toast({ title: "حدث خطأ", description: "فشل في حفظ السند", variant: "destructive" });
    }
  };

  const handleDeleteClick = (payment: Payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (paymentToDelete) {
      deletePayment(paymentToDelete.id);
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const handlePrintReceipt = (payment: Payment) => {
    setPrintPayment(payment);
    setTimeout(() => window.print(), 100);
  };

  const handlePrint = (payment: Partial<Payment>) => {
    handlePrintReceipt(payment as Payment);
  };

  return (
    <PageErrorBoundary pageName="المدفوعات">
      <MobileOptimizedLayout>
        <PaymentsHeader
          onAddPayment={handleAddPayment}
          payments={filteredPayments}
        />

        <PaymentsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <PaymentsStats
          totalReceipts={totalReceipts}
          totalVouchers={totalVouchers}
          totalReceiptsAmount={totalReceiptsAmount}
          totalVouchersAmount={totalVouchersAmount}
        />

        <PaymentsTable
          payments={paginatedPayments}
          isLoading={isLoading}
          onEdit={handleEditPayment}
          onDelete={handleDeleteClick}
          onPrint={handlePrint}
        />

        <PaymentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          payment={selectedPayment}
          onSave={handleSavePayment}
        />

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          title="حذف السند"
          description="هل أنت متأكد من حذف هذا السند؟ سيتم حذف القيد المحاسبي المرتبط به."
          itemName={paymentToDelete ? `${paymentToDelete.payment_number} - ${paymentToDelete.amount} ر.س` : ""}
          isLoading={false}
        />

        {printPayment && (
          <PaymentReceiptTemplate
            payment={toPaymentReceipt({
              ...printPayment,
              contract_number: (printPayment as PaymentWithContract).contract_number,
              tenant_name: (printPayment as PaymentWithContract).tenant_name,
              property_name: (printPayment as PaymentWithContract).property_name,
            })}
          />
        )}
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Payments;
