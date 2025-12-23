import { useState, useMemo } from "react";
import { Search, Edit, Trash2, FileText, Receipt } from "lucide-react";
import { useRentalPayments, type RentalPayment } from "@/hooks/property/useRentalPayments";
import { useDocumentViewer } from "@/hooks/payments/useDocumentViewer";
import { Input } from "@/components/ui/input";
import { ArrearsReport } from "@/components/rental/ArrearsReport";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, arLocale as ar } from "@/lib/date";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { UnifiedDataTable } from "@/components/unified/UnifiedDataTable";

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
        <Search className="absolute end-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="البحث عن دفعة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pe-10"
        />
      </div>

      {/* إحصائيات متجاوبة - 2 أعمدة على الجوال */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">إجمالي المدفوع</div>
          <div className="text-lg sm:text-2xl font-bold text-success">
            {totalPaid.toLocaleString('ar-SA')} <span className="text-xs sm:text-sm">ر.س</span>
          </div>
        </Card>
        
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">تحت التحصيل</div>
          <div className="text-lg sm:text-2xl font-bold text-warning">
            {underCollectionPayments.toLocaleString('ar-SA')} <span className="text-xs sm:text-sm">ر.س</span>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">معلق</div>
          <div className="text-lg sm:text-2xl font-bold text-info">
            {totalDue.toLocaleString('ar-SA')} <span className="text-xs sm:text-sm">ر.س</span>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">المتأخرات</div>
          <div className="text-lg sm:text-2xl font-bold text-destructive">
            {overduePayments.toLocaleString('ar-SA')} <span className="text-xs sm:text-sm">ر.س</span>
          </div>
        </Card>
      </div>

      {/* جدول الدفعات باستخدام UnifiedDataTable */}
      <UnifiedDataTable
        title="الدفعات"
        columns={[
          {
            key: "payment_number",
            label: "رقم الدفعة",
            render: (value: string) => <span className="font-medium">{value}</span>
          },
          {
            key: "contract",
            label: "العقد",
            hideOnMobile: true,
            hideOnTablet: true,
            render: (_: unknown, row: RentalPayment) => row.contracts?.contract_number || '-'
          },
          {
            key: "tenant",
            label: "المستأجر",
            hideOnMobile: true,
            render: (_: unknown, row: RentalPayment) => row.contracts?.tenant_name || '-'
          },
          {
            key: "due_date",
            label: "تاريخ الاستحقاق",
            hideOnMobile: true,
            hideOnTablet: true,
            render: (_: unknown, row: RentalPayment) => (
              <span className="whitespace-nowrap">
                {format(new Date(row.due_date), 'yyyy/MM/dd', { locale: ar })}
              </span>
            )
          },
          {
            key: "amount_due",
            label: "المستحق",
            hideOnMobile: true,
            render: (value: number) => (
              <span className="font-medium whitespace-nowrap">
                {Number(value).toLocaleString()} ر.س
              </span>
            )
          },
          {
            key: "amount_paid",
            label: "المدفوع",
            render: (value: number) => (
              <span className="font-bold text-success whitespace-nowrap">
                {Number(value).toLocaleString()} ر.س
              </span>
            )
          },
          {
            key: "remaining",
            label: "المتبقي",
            hideOnMobile: true,
            hideOnTablet: true,
            render: (_: unknown, row: RentalPayment) => (
              <span className="font-bold text-warning whitespace-nowrap">
                {(Number(row.amount_due) - Number(row.amount_paid)).toLocaleString()} ر.س
              </span>
            )
          },
          {
            key: "status",
            label: "الحالة",
            render: (_: unknown, row: RentalPayment) => (
              <Badge className={getPaymentStatus(row).color}>
                {getPaymentStatus(row).status}
              </Badge>
            )
          }
        ]}
        data={filteredPayments}
        loading={isLoading}
        emptyMessage="لا توجد دفعات"
        actions={(payment: RentalPayment) => (
          <div className="flex gap-1">
            {payment.invoice_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewInvoice(payment)}
                title="عرض الفاتورة"
                className="text-info hover:text-info/80 hover:bg-info/10 h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-2"
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
            {payment.receipt_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewReceipt(payment)}
                title="عرض سند القبض"
                className="text-success hover:text-success/80 hover:bg-success/10 h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-2"
              >
                <Receipt className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(payment)}
              title="تعديل الدفعة"
              className="hover:bg-primary/10 h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(payment)}
              title="حذف الدفعة"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        showMobileScrollHint={true}
      />

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
