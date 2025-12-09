import { useState, useMemo } from "react";
import { Search, Edit, Trash2, FileText, Receipt } from "lucide-react";
import { useRentalPayments } from "@/hooks/useRentalPayments";
import { useDocumentViewer } from "@/hooks/payments/useDocumentViewer";
import { Input } from "@/components/ui/input";
import { ArrearsReport } from "@/components/rental/ArrearsReport";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, arLocale as ar } from "@/lib/date";
import { type RentalPayment } from "@/hooks/useRentalPayments";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

interface Props {
  onEdit: (payment: RentalPayment) => void;
}

export const PaymentsTab = ({ onEdit }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<RentalPayment | null>(null);
  
  const { payments, isLoading, deletePayment } = useRentalPayments();
  const { viewInvoice, viewReceipt } = useDocumentViewer();

  const handleDeleteClick = (payment: RentalPayment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (paymentToDelete) {
      deletePayment.mutate(paymentToDelete.id);
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const handleViewInvoice = (payment: RentalPayment) => {
    if (payment.invoice_id) {
      viewInvoice(payment.invoice_id);
    }
  };

  const handleViewReceipt = (payment: RentalPayment) => {
    if (payment.receipt_id) {
      viewReceipt(payment.receipt_id);
    }
  };

  const filteredPayments = useMemo(() => {
    if (!searchQuery) return payments;
    
    const query = searchQuery.toLowerCase();
    return payments?.filter(
      (p) =>
        p.payment_number.toLowerCase().includes(query) ||
        p.contracts?.tenant_name.toLowerCase().includes(query)
    ) || [];
  }, [payments, searchQuery]);

  const getPaymentStatus = (payment: RentalPayment) => {
    if (payment.status === 'تحت التحصيل') {
      return { status: 'تحت التحصيل', color: 'bg-warning-light text-warning border-warning/30' };
    }
    
    if (payment.status === 'مدفوع' || payment.payment_date) {
      return { status: 'مدفوع', color: 'bg-success-light text-success border-success/30' };
    }
    
    const today = new Date();
    const dueDate = new Date(payment.due_date);
    
    if (dueDate < today && payment.status !== 'مدفوع' && !payment.payment_date) {
      return { status: 'متأخر', color: 'bg-destructive-light text-destructive border-destructive/30' };
    }
    
    return { status: 'معلق', color: 'bg-info-light text-info border-info/30' };
  };

  const totalPaid = payments?.filter(p => p.status === 'مدفوع' || p.payment_date).reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0;
  const underCollectionPayments = payments?.filter(p => p.status === 'تحت التحصيل').reduce((sum, p) => sum + Number(p.amount_due), 0) || 0;
  const totalDue = payments?.filter(p => p.status !== 'مدفوع' && !p.payment_date && p.status !== 'تحت التحصيل').reduce((sum, p) => sum + Number(p.amount_due), 0) || 0;
  const overduePayments = payments?.filter(p => {
    const dueDate = new Date(p.due_date);
    return dueDate < new Date() && p.status !== 'مدفوع' && !p.payment_date && p.status !== 'تحت التحصيل';
  }).reduce((sum, p) => sum + Number(p.amount_due), 0) || 0;

  const paymentsWithTenant = payments.map(p => ({
    ...p,
    tenant_name: p.contracts?.tenant_name,
    tenant_phone: p.contracts?.tenant_phone,
    tenant_email: p.contracts?.tenant_email,
    contract_number: p.contracts?.contract_number,
  }));

  return (
    <div className="space-y-6">
      <ArrearsReport payments={paymentsWithTenant} />

      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="البحث عن دفعة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">إجمالي المدفوع</div>
          <div className="text-2xl font-bold text-success">
            {totalPaid.toLocaleString('ar-SA')} ر.س
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">تحت التحصيل</div>
          <div className="text-2xl font-bold text-warning">
            {underCollectionPayments.toLocaleString('ar-SA')} ر.س
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">معلق</div>
          <div className="text-2xl font-bold text-info">
            {totalDue.toLocaleString('ar-SA')} ر.س
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">المتأخرات</div>
          <div className="text-2xl font-bold text-destructive">
            {overduePayments.toLocaleString('ar-SA')} ر.س
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد دفعات</div>
      ) : (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4">رقم الدفعة</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4 hidden lg:table-cell">العقد</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4 hidden md:table-cell">المستأجر</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4 hidden lg:table-cell">تاريخ الاستحقاق</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4 hidden md:table-cell">المبلغ المستحق</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4">المبلغ المدفوع</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4 hidden lg:table-cell">المتبقي</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4">الحالة</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment, index) => (
                <TableRow 
                  key={payment.id}
                  className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                >
                  <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap py-3 px-4">{payment.payment_number}</TableCell>
                  <TableCell className="text-xs sm:text-sm py-3 px-4 hidden lg:table-cell">{payment.contracts?.contract_number || '-'}</TableCell>
                  <TableCell className="text-xs sm:text-sm py-3 px-4 hidden md:table-cell">{payment.contracts?.tenant_name || '-'}</TableCell>
                  <TableCell className="text-xs sm:text-sm py-3 px-4 hidden lg:table-cell whitespace-nowrap">
                    {format(new Date(payment.due_date), 'yyyy/MM/dd', { locale: ar })}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap py-3 px-4 hidden md:table-cell">
                    {Number(payment.amount_due).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="font-bold text-success text-xs sm:text-sm whitespace-nowrap py-3 px-4">
                    {Number(payment.amount_paid).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="font-bold text-warning text-xs sm:text-sm whitespace-nowrap py-3 px-4 hidden lg:table-cell">
                    {(Number(payment.amount_due) - Number(payment.amount_paid)).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm py-3 px-4">
                    <Badge className={getPaymentStatus(payment).color}>
                      {getPaymentStatus(payment).status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm py-3 px-4">
                    <div className="flex gap-1">
                      {payment.invoice_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(payment)}
                          title="عرض الفاتورة"
                          className="text-info hover:text-info/80 hover:bg-info/10"
                        >
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      )}
                      {payment.receipt_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReceipt(payment)}
                          title="عرض سند القبض"
                          className="text-success hover:text-success/80 hover:bg-success/10"
                        >
                          <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(payment)}
                        title="تعديل الدفعة"
                        className="hover:bg-primary/10"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(payment)}
                        title="حذف الدفعة"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="حذف الدفعة"
        description="هل أنت متأكد من حذف هذه الدفعة؟ سيتم حذف القيد المحاسبي المرتبط بها."
        itemName={paymentToDelete ? `${paymentToDelete.payment_number} - ${paymentToDelete.amount_due} ر.س` : ""}
        isLoading={deletePayment.isPending}
      />
    </div>
  );
};
