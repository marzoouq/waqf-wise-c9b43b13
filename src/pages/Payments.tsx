import { useState, useMemo, useCallback } from "react";
import { Plus, Search, Receipt, CreditCard, Printer, Edit, Trash2, FileText } from "lucide-react";
import { PaymentDialog } from "@/components/payments/PaymentDialog";
import { usePayments } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const ITEMS_PER_PAGE = 20;

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { payments, isLoading, addPayment, updatePayment, deletePayment } = usePayments();

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

  const handleEditPayment = useCallback((payment: any) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  }, []);

  const handleSavePayment = async (data: any) => {
    if (selectedPayment) {
      await updatePayment({ id: selectedPayment.id, ...data });
    } else {
      await addPayment(data);
    }
    setDialogOpen(false);
  };

  const handleDeletePayment = useCallback(async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا السند؟")) {
      await deletePayment(id);
    }
  }, [deletePayment]);

  const handlePrint = (payment: any) => {
    // TODO: Implement print functionality
    console.log("Print payment:", payment);
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary">
              إدارة المدفوعات
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              سندات القبض والصرف والمدفوعات
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft w-full md:w-auto"
            onClick={handleAddPayment}
          >
            <Plus className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            <span className="text-sm md:text-base">إضافة سند جديد</span>
          </Button>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

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
                              onClick={() => handleEditPayment(payment)}
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
      </div>
    </div>
  );
};

export default Payments;
