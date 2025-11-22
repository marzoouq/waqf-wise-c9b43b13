import { useState, useMemo } from "react";
import { Search, Edit, Trash2, FileText, Receipt } from "lucide-react";
import { useRentalPayments } from "@/hooks/useRentalPayments";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { type RentalPayment } from "@/hooks/useRentalPayments";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onEdit: (payment: RentalPayment) => void;
}

export const PaymentsTab = ({ onEdit }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<RentalPayment | null>(null);
  
  const { payments, isLoading, deletePayment } = useRentalPayments();
  const { toast } = useToast();

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

  const handleViewInvoice = async (payment: RentalPayment) => {
    if (!payment.invoice_id) {
      toast({
        title: "تنبيه",
        description: "لم يتم إصدار فاتورة لهذه الدفعة بعد",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', payment.invoice_id)
        .single();

      if (error || !data) {
        toast({
          title: "خطأ",
          description: "فشل تحميل بيانات الفاتورة",
          variant: "destructive"
        });
        return;
      }

      // فتح صفحة الفاتورة في نافذة جديدة
      window.open(`/invoices?view=${data.id}`, '_blank');
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء عرض الفاتورة",
        variant: "destructive"
      });
    }
  };

  const handleViewReceipt = async (payment: RentalPayment) => {
    if (!payment.receipt_id) {
      toast({
        title: "تنبيه",
        description: "لم يتم إصدار سند قبض لهذه الدفعة بعد",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', payment.receipt_id)
        .single();

      if (error || !data) {
        toast({
          title: "خطأ",
          description: "فشل تحميل بيانات سند القبض",
          variant: "destructive"
        });
        return;
      }

      // يمكن هنا توليد PDF لسند القبض أو فتح صفحة عرض
      toast({
        title: "سند القبض",
        description: `رقم السند: ${data.payment_number}`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء عرض سند القبض",
        variant: "destructive"
      });
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
    // Under collection - orange/yellow distinct color
    if (payment.status === 'تحت التحصيل') {
      return { status: 'تحت التحصيل', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    }
    
    // Paid - green
    if (payment.status === 'مدفوع' || payment.payment_date) {
      return { status: 'مدفوع', color: 'bg-green-100 text-green-800 border-green-200' };
    }
    
    const today = new Date();
    const dueDate = new Date(payment.due_date);
    
    // Overdue - red
    if (dueDate < today && payment.status !== 'مدفوع' && !payment.payment_date) {
      return { status: 'متأخر', color: 'bg-red-100 text-red-800 border-red-200' };
    }
    
    // Pending - blue (should be hidden by filter but keep for safety)
    return { status: 'معلق', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  const totalPaid = payments?.filter(p => p.status === 'مدفوع' || p.payment_date).reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0;
  
  const underCollectionPayments = payments?.filter(p => p.status === 'تحت التحصيل').reduce((sum, p) => sum + Number(p.amount_due), 0) || 0;
  
  const totalDue = payments?.filter(p => p.status !== 'مدفوع' && !p.payment_date && p.status !== 'تحت التحصيل').reduce((sum, p) => sum + Number(p.amount_due), 0) || 0;
  
  const overduePayments = payments?.filter(p => {
    const dueDate = new Date(p.due_date);
    return dueDate < new Date() && p.status !== 'مدفوع' && !p.payment_date && p.status !== 'تحت التحصيل';
  }).reduce((sum, p) => sum + Number(p.amount_due), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="البحث عن دفعة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">إجمالي المدفوع</div>
          <div className="text-2xl font-bold text-green-600">
            {totalPaid.toLocaleString('ar-SA')} ر.س
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">تحت التحصيل</div>
          <div className="text-2xl font-bold text-orange-600">
            {underCollectionPayments.toLocaleString('ar-SA')} ر.س
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">معلق</div>
          <div className="text-2xl font-bold text-blue-600">
            {totalDue.toLocaleString('ar-SA')} ر.س
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">المتأخرات</div>
          <div className="text-2xl font-bold text-red-600">
            {overduePayments.toLocaleString('ar-SA')} ر.س
          </div>
        </Card>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد دفعات</div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">رقم الدفعة</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">العقد</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">المستأجر</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">تاريخ الاستحقاق</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">المبلغ المستحق</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">المبلغ المدفوع</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">المتبقي</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الحالة</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{payment.payment_number}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{payment.contracts?.contract_number || '-'}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden md:table-cell">{payment.contracts?.tenant_name || '-'}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell whitespace-nowrap">
                    {format(new Date(payment.due_date), 'yyyy/MM/dd', { locale: ar })}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                    {Number(payment.amount_due).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="font-bold text-success text-xs sm:text-sm whitespace-nowrap">
                    {Number(payment.amount_paid).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="font-bold text-warning text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                    {(Number(payment.amount_due) - Number(payment.amount_paid)).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <Badge className={getPaymentStatus(payment).color}>
                      {getPaymentStatus(payment).status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <div className="flex gap-1">
                      {payment.invoice_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(payment)}
                          title="عرض الفاتورة"
                          className="text-blue-600 hover:text-blue-700"
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
                          className="text-green-600 hover:text-green-700"
                        >
                          <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(payment)}
                        title="تعديل الدفعة"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(payment)}
                        title="حذف الدفعة"
                        className="text-destructive hover:text-destructive"
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