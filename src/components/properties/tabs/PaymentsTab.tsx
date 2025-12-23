import { useState, useMemo } from "react";
import { Search, Edit, Trash2, FileText, Receipt } from "lucide-react";
import { useRentalPayments, type RentalPayment } from "@/hooks/property/useRentalPayments";
import { useDocumentViewer } from "@/hooks/payments/useDocumentViewer";
import { useTableSort } from "@/hooks/ui/useTableSort";
import { useBulkSelection } from "@/hooks/ui/useBulkSelection";
import { Input } from "@/components/ui/input";
import { ArrearsReport } from "@/components/rental/ArrearsReport";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { format, arLocale as ar } from "@/lib/date";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { UnifiedDataTable } from "@/components/unified/UnifiedDataTable";
import { ExportButton } from "@/components/shared/ExportButton";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";
import { AdvancedFiltersDialog, type FilterConfig, type FiltersRecord } from "@/components/shared/AdvancedFiltersDialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from "@/lib/pagination.types";
import { toast } from "sonner";

// تعريف الفلاتر
const paymentsFilterConfigs: FilterConfig[] = [
  {
    key: 'status',
    label: 'الحالة',
    type: 'select',
    options: [
      { value: 'مدفوع', label: 'مدفوع' },
      { value: 'معلق', label: 'معلق' },
      { value: 'متأخر', label: 'متأخر' },
      { value: 'تحت التحصيل', label: 'تحت التحصيل' },
    ],
  },
  { key: 'due_date_from', label: 'من تاريخ', type: 'date' },
  { key: 'due_date_to', label: 'إلى تاريخ', type: 'date' },
];

interface Props {
  onEdit: (payment: RentalPayment) => void;
}

export const PaymentsTab = ({ onEdit }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<FiltersRecord>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<RentalPayment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  
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

  // دالة مساعدة لحساب حالة الدفعة
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

  const filteredPayments = useMemo(() => {
    let result = payments || [];
    
    // فلترة بالبحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.payment_number.toLowerCase().includes(query) ||
          p.contracts?.tenant_name.toLowerCase().includes(query)
      );
    }
    
    // فلترة بالحالة
    if (advancedFilters.status) {
      result = result.filter(p => {
        const status = getPaymentStatus(p).status;
        return status === advancedFilters.status;
      });
    }
    
    // فلترة بالتاريخ
    if (advancedFilters.due_date_from) {
      const fromDate = new Date(String(advancedFilters.due_date_from));
      result = result.filter(p => new Date(p.due_date) >= fromDate);
    }
    if (advancedFilters.due_date_to) {
      const toDate = new Date(String(advancedFilters.due_date_to));
      result = result.filter(p => new Date(p.due_date) <= toDate);
    }
    
    return result;
  }, [payments, searchQuery, advancedFilters]);

  // Sorting
  const { sortedData, sortConfig, handleSort } = useTableSort({
    data: filteredPayments,
    defaultSortKey: 'due_date',
    defaultDirection: 'desc',
  });

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Bulk Selection - must be after paginatedData
  const {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
  } = useBulkSelection(paginatedData);

  // Bulk delete state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      deletePayment.mutate(id);
    }
    clearSelection();
    setBulkDeleteDialogOpen(false);
    toast.success(`تم حذف ${selectedIds.length} دفعة بنجاح`);
  };

  const handleBulkExport = () => {
    const selectedData = paginatedData
      .filter(p => selectedIds.includes(p.id))
      .map(p => ({
        'رقم الدفعة': p.payment_number,
        'رقم العقد': p.contracts?.contract_number || '-',
        'المستأجر': p.contracts?.tenant_name || '-',
        'تاريخ الاستحقاق': format(new Date(p.due_date), 'yyyy/MM/dd', { locale: ar }),
        'المستحق': Number(p.amount_due).toLocaleString(),
        'المدفوع': Number(p.amount_paid).toLocaleString(),
        'الحالة': getPaymentStatus(p).status,
      }));
    return selectedData;
  };

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, advancedFilters]);

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

  // بيانات التصدير
  const exportData = filteredPayments.map(p => ({
    'رقم الدفعة': p.payment_number,
    'رقم العقد': p.contracts?.contract_number || '-',
    'المستأجر': p.contracts?.tenant_name || '-',
    'تاريخ الاستحقاق': format(new Date(p.due_date), 'yyyy/MM/dd', { locale: ar }),
    'المستحق': Number(p.amount_due).toLocaleString(),
    'المدفوع': Number(p.amount_paid).toLocaleString(),
    'المتبقي': (Number(p.amount_due) - Number(p.amount_paid)).toLocaleString(),
    'الحالة': getPaymentStatus(p).status,
  }));

  return (
    <div className="space-y-6">
      <ArrearsReport payments={paymentsWithTenant} />

      {/* Search, Filters, and Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute end-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="البحث عن دفعة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pe-10"
          />
        </div>
        <AdvancedFiltersDialog
          filters={paymentsFilterConfigs}
          activeFilters={advancedFilters}
          onApplyFilters={setAdvancedFilters}
          onClearFilters={() => setAdvancedFilters({})}
        />
        <ExportButton
          data={exportData}
          filename="الدفعات"
          title="دفعات الإيجار"
          headers={['رقم الدفعة', 'رقم العقد', 'المستأجر', 'تاريخ الاستحقاق', 'المستحق', 'المدفوع', 'المتبقي', 'الحالة']}
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
            key: "select",
            label: (
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleAll}
                aria-label="تحديد الكل"
              />
            ),
            render: (_: unknown, row: RentalPayment) => (
              <Checkbox
                checked={isSelected(row.id)}
                onCheckedChange={() => toggleSelection(row.id)}
                aria-label={`تحديد ${row.payment_number}`}
                onClick={(e) => e.stopPropagation()}
              />
            ),
          },
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
        data={paginatedData}
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

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          startIndex={startIndex + 1}
          endIndex={endIndex}
          canGoNext={currentPage < totalPages}
          canGoPrev={currentPage > 1}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          onNext={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          onPrev={() => setCurrentPage(p => Math.max(p - 1, 1))}
          onFirst={() => setCurrentPage(1)}
          onLast={() => setCurrentPage(totalPages)}
        />
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

      {/* Bulk Delete Dialog */}
      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={handleBulkDelete}
        title="حذف الدفعات المحددة"
        description={`هل أنت متأكد من حذف ${selectedCount} دفعة؟`}
        itemName={`${selectedCount} دفعة`}
        isDestructive={true}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onDelete={() => setBulkDeleteDialogOpen(true)}
        onExport={() => {
          const data = handleBulkExport();
          toast.success(`تم تجهيز ${data.length} دفعة للتصدير`);
        }}
      />
    </div>
  );
};
