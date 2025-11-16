import { useState, useMemo, useCallback } from "react";
import { Plus, Search, Receipt, CreditCard, Printer, Edit, Trash2, FileText } from "lucide-react";
import { PaymentDialog } from "@/components/payments/PaymentDialog";
import { usePayments } from "@/hooks/usePayments";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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

type Payment = Database['public']['Tables']['payments']['Row'];

const ITEMS_PER_PAGE = 20;

const Payments = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { payments, isLoading, addPayment, updatePayment, deletePayment } = usePayments();
  const { createAutoEntry } = useJournalEntries();

  // Memoize filtered payments
  const filteredPayments = useMemo(() => {
    if (!searchQuery) return payments;

    const query = searchQuery.toLowerCase();
    return payments.filter(
      (p) =>
        p.payment_number.toLowerCase().includes(query) ||
        p.payer_name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }, [payments, searchQuery]);

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
      let paymentId: string;
      
      if (selectedPayment) {
        await updatePayment({ id: selectedPayment.id, ...data } as Parameters<typeof updatePayment>[0]);
        paymentId = selectedPayment.id;
      } else {
        const result = await addPayment(data as Parameters<typeof addPayment>[0]);
        paymentId = result.id;
      }

      // Create automatic journal entry
      const triggerEvent = data.payment_type === 'receipt' ? 'payment_received' : 'payment_made';
      await createAutoEntry(
        triggerEvent,
        paymentId,
        Number(data.amount),
        data.description as string,
        data.payment_date as string
      );

      setDialogOpen(false);
    } catch (error) {
      logger.error(error, { context: 'save_payment', severity: 'medium' });
    }
  };

  const handleDeletePayment = useCallback(async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا السند؟")) {
      await deletePayment(id);
    }
  }, [deletePayment]);

  const handlePrint = (payment: Partial<Payment>) => {
    toast({
      title: "قريباً",
      description: "سيتم إضافة وظيفة الطباعة قريباً",
    });
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
                    <TableHead>رقم السند</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الطريقة</TableHead>
                    <TableHead>البيان</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {searchQuery
                          ? "لا توجد نتائج تطابق البحث"
                          : "لا يوجد سندات حالياً. قم بإضافة سند جديد."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.payment_number}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              payment.payment_type === "receipt"
                                ? "bg-success/10 text-success"
                                : "bg-destructive/10 text-destructive"
                            }
                          >
                            {payment.payment_type === "receipt" ? "قبض" : "صرف"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(payment.payment_date), "dd MMM yyyy", {
                            locale: ar,
                          })}
                        </TableCell>
                        <TableCell>{payment.payer_name}</TableCell>
                        <TableCell className="font-bold">
                          {Number(payment.amount).toLocaleString()} ر.س
                        </TableCell>
                        <TableCell>
                          {getPaymentMethodLabel(payment.payment_method)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
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
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeletePayment(payment.id)}
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
    </MobileOptimizedLayout>
  );
};

export default Payments;
