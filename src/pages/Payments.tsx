import { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, Search, Receipt, CreditCard, Printer, Edit, Trash2, FileText } from "lucide-react";
import { PaymentDialog } from "@/components/payments/PaymentDialog";
import { usePayments } from "@/hooks/usePayments";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/dashboard/DashboardStats";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Pagination } from "@/components/ui/pagination";
import { logger } from "@/lib/logger";
import { MobileOptimizedLayout, MobileOptimizedHeader, MobileOptimizedGrid } from "@/components/layout/MobileOptimizedLayout";
import { Database } from '@/integrations/supabase/types';
import { ExportButton } from "@/components/shared/ExportButton";
import { PaymentReceiptTemplate } from "@/components/payments/PaymentReceiptTemplate";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

type Payment = Database['public']['Tables']['payments']['Row'];

interface PaymentWithContract extends Payment {
  contract_number?: string;
  tenant_name?: string;
  property_name?: string;
}

const ITEMS_PER_PAGE = 20;

const Payments = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [printPayment, setPrintPayment] = useState<Payment | null>(null);
  const [paymentsWithContracts, setPaymentsWithContracts] = useState<PaymentWithContract[]>([]);

  const { payments, isLoading, addPayment, updatePayment, deletePayment } = usePayments();
  const { createAutoEntry } = useJournalEntries();

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

  // Memoize stats
  const stats = useMemo(() => {
    const receipts = payments.filter((p) => p.payment_type === "receipt");
    const paymentsOut = payments.filter((p) => p.payment_type === "payment");
    const totalReceipts = receipts.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPayments = paymentsOut.reduce((sum, p) => sum + Number(p.amount), 0);

    return [
      {
        label: "إجمالي المقبوضات",
        value: `${totalReceipts.toLocaleString()} ر.س`,
        icon: Receipt,
        color: "text-success",
      },
      {
        label: "إجمالي المدفوعات",
        value: `${totalPayments.toLocaleString()} ر.س`,
        icon: CreditCard,
        color: "text-destructive",
      },
      {
        label: "الصافي",
        value: `${(totalReceipts - totalPayments).toLocaleString()} ر.س`,
        icon: FileText,
        color: totalReceipts >= totalPayments ? "text-success" : "text-destructive",
      },
      {
        label: "عدد السندات",
        value: payments.length.toString(),
        icon: FileText,
        color: "text-primary",
      },
    ];
  }, [payments]);

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
      } else {
        await addPayment(data as Parameters<typeof addPayment>[0]);
      }

      // القيد المحاسبي يتم إنشاؤه تلقائياً عبر database trigger
      setDialogOpen(false);
    } catch (error) {
      logger.error(error, { context: 'save_payment', severity: 'medium' });
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

  const handleDeletePayment = useCallback(async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا السند؟")) {
      await deletePayment(id);
    }
  }, [deletePayment]);

  const handlePrint = (payment: Partial<Payment>) => {
    // استخدام الطباعة الفعلية
    handlePrintReceipt(payment as Payment);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "نقداً",
      bank_transfer: "تحويل بنكي",
      cheque: "شيك",
      card: "بطاقة ائتمان",
    };
    return labels[method] || method;
  };

  return (
    <PageErrorBoundary pageName="المدفوعات">
      <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="المدفوعات والمقبوضات"
        description="إدارة سندات القبض والصرف"
        icon={<Receipt className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        actions={
          <Button onClick={handleAddPayment} size="sm">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
            <span className="hidden sm:inline">سند جديد</span>
            <span className="sm:hidden">جديد</span>
          </Button>
        }
      />

        {/* Search */}
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="البحث عن سند (رقم السند، الاسم، البيان...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <MobileOptimizedGrid cols={4}>
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </MobileOptimizedGrid>

        {/* Payments Table */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>السندات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">رقم السند</TableHead>
                    <TableHead className="whitespace-nowrap">النوع</TableHead>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">التاريخ</TableHead>
                    <TableHead className="whitespace-nowrap">الاسم</TableHead>
                    <TableHead className="whitespace-nowrap hidden lg:table-cell">العقد</TableHead>
                    <TableHead className="whitespace-nowrap hidden xl:table-cell">العقار</TableHead>
                    <TableHead className="whitespace-nowrap">المبلغ</TableHead>
                    <TableHead className="whitespace-nowrap hidden lg:table-cell">الطريقة</TableHead>
                    <TableHead className="whitespace-nowrap hidden lg:table-cell">البيان</TableHead>
                    <TableHead className="text-left whitespace-nowrap">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        {searchQuery
                          ? "لا توجد نتائج تطابق البحث"
                          : "لا يوجد سندات حالياً. قم بإضافة سند جديد."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">
                          {payment.payment_number}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              payment.payment_type === "receipt"
                                ? "bg-success/10 text-success text-xs"
                                : "bg-destructive/10 text-destructive text-xs"
                            }
                          >
                            {payment.payment_type === "receipt" ? "قبض" : "صرف"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs sm:text-sm whitespace-nowrap">
                          {format(new Date(payment.payment_date), "dd MMM yyyy", {
                            locale: ar,
                          })}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">{payment.payer_name}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                          {payment.contract_number ? (
                            <Badge variant="outline" className="text-xs">
                              {payment.contract_number}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs sm:text-sm max-w-[150px] truncate">
                          {payment.property_name || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="font-bold text-xs sm:text-sm whitespace-nowrap">
                          {Number(payment.amount).toLocaleString()} ر.س
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                          {getPaymentMethodLabel(payment.payment_method)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-xs sm:text-sm">
                          {payment.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrint(payment)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                            onClick={() => handleEditPayment(payment as Payment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(payment as Payment)}
                              className="text-destructive hover:text-destructive"
                              title="حذف السند"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredPayments.length}
              />
            )}
          </CardContent>
        </Card>

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
            payment={printPayment as any}
          />
        )}
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Payments;
