import { useState, useMemo } from "react";
import { Search, Edit, Trash2, FileText, Receipt } from "lucide-react";
import { useRentalPayments } from "@/hooks/useRentalPayments";
import { Input } from "@/components/ui/input";
import { ArrearsReport } from "@/components/rental/ArrearsReport";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, arLocale as ar } from "@/lib/date";
import { type RentalPayment } from "@/hooks/useRentalPayments";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { generateReceiptPDF } from "@/lib/generateReceiptPDF";
import type { OrganizationSettings } from "@/hooks/useOrganizationSettings";

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
      // جلب بيانات الفاتورة الكاملة
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, invoice_lines(*)')
        .eq('id', payment.invoice_id)
        .single();

      if (invoiceError || !invoiceData) {
        toast({
          title: "خطأ",
          description: "فشل تحميل بيانات الفاتورة",
          variant: "destructive"
        });
        return;
      }

      // البحث عن المستند المؤرشف في Storage
      const { data: documentData } = await supabase
        .from('documents')
        .select('id, name, file_path')
        .eq('name', `Invoice-${invoiceData.invoice_number}.pdf`)
        .single();

      if (documentData) {
        // فتح PDF من Storage
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(`invoices/${new Date(invoiceData.invoice_date).getFullYear()}/${new Date(invoiceData.invoice_date).getMonth() + 1}/Invoice-${invoiceData.invoice_number}.pdf`);
        
        window.open(publicUrl, '_blank');
      } else {
        // fallback: توليد PDF فوري
        const { data: orgSettings } = await supabase
          .from('organization_settings')
          .select('id, organization_name_ar, organization_name_en, address_ar, phone, email, logo_url, vat_registration_number, commercial_registration_number')
          .single();

        if (orgSettings) {
          await generateInvoicePDF(invoiceData, invoiceData.invoice_lines || [], orgSettings as OrganizationSettings | null);
          
          toast({
            title: "تم التوليد",
            description: "تم توليد الفاتورة وتحميلها",
          });
        }
      }
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
      // جلب بيانات سند القبض
      const { data: receiptData, error: receiptError } = await supabase
        .from('payments')
        .select('id, payment_number, payment_date, amount, description, payment_method, beneficiary_id, reference_number, payer_name')
        .eq('id', payment.receipt_id)
        .single();

      if (receiptError || !receiptData) {
        toast({
          title: "خطأ",
          description: "فشل تحميل بيانات سند القبض",
          variant: "destructive"
        });
        return;
      }

      // البحث عن المستند المؤرشف
      const { data: documentData } = await supabase
        .from('documents')
        .select('id, name, file_path')
        .eq('name', `Receipt-${receiptData.payment_number}.pdf`)
        .single();

      if (documentData) {
        // فتح PDF من Storage
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(`receipts/${new Date(receiptData.payment_date).getFullYear()}/${new Date(receiptData.payment_date).getMonth() + 1}/Receipt-${receiptData.payment_number}.pdf`);
        
        window.open(publicUrl, '_blank');
      } else {
        // fallback: توليد PDF فوري
        const { data: orgSettings } = await supabase
          .from('organization_settings')
          .select('id, organization_name_ar, organization_name_en, address_ar, phone, email, logo_url, vat_registration_number, commercial_registration_number')
          .single();

        if (orgSettings) {
          await generateReceiptPDF(receiptData, orgSettings as OrganizationSettings | null);
          
          toast({
            title: "تم التوليد",
            description: "تم توليد سند القبض وتحميله",
          });
        }
      }
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
      return { status: 'تحت التحصيل', color: 'bg-warning-light text-warning border-warning/30' };
    }
    
    // Paid - green
    if (payment.status === 'مدفوع' || payment.payment_date) {
      return { status: 'مدفوع', color: 'bg-success-light text-success border-success/30' };
    }
    
    const today = new Date();
    const dueDate = new Date(payment.due_date);
    
    // Overdue - red
    if (dueDate < today && payment.status !== 'مدفوع' && !payment.payment_date) {
      return { status: 'متأخر', color: 'bg-destructive-light text-destructive border-destructive/30' };
    }
    
    // Pending - blue (should be hidden by filter but keep for safety)
    return { status: 'معلق', color: 'bg-info-light text-info border-info/30' };
  };

  const totalPaid = payments?.filter(p => p.status === 'مدفوع' || p.payment_date).reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0;
  
  const underCollectionPayments = payments?.filter(p => p.status === 'تحت التحصيل').reduce((sum, p) => sum + Number(p.amount_due), 0) || 0;
  
  const totalDue = payments?.filter(p => p.status !== 'مدفوع' && !p.payment_date && p.status !== 'تحت التحصيل').reduce((sum, p) => sum + Number(p.amount_due), 0) || 0;
  
  const overduePayments = payments?.filter(p => {
    const dueDate = new Date(p.due_date);
    return dueDate < new Date() && p.status !== 'مدفوع' && !p.payment_date && p.status !== 'تحت التحصيل';
  }).reduce((sum, p) => sum + Number(p.amount_due), 0) || 0;

  // تحضير البيانات لـ ArrearsReport
  const paymentsWithTenant = payments.map(p => ({
    ...p,
    tenant_name: p.contracts?.tenant_name,
    tenant_phone: p.contracts?.tenant_phone,
    tenant_email: p.contracts?.tenant_email,
    contract_number: p.contracts?.contract_number,
  }));

  return (
    <div className="space-y-6">
      {/* Arrears Report */}
      <ArrearsReport payments={paymentsWithTenant} />

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

      {/* Payments Table */}
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