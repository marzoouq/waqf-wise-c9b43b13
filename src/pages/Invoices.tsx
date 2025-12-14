import { Plus, Eye, Edit, Trash2, MoreVertical, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddInvoiceDialog } from "@/components/invoices/AddInvoiceDialog";
import { ViewInvoiceDialog } from "@/components/invoices/ViewInvoiceDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ExportButton } from "@/components/shared/ExportButton";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, arLocale as ar } from "@/lib/date";
import { Pagination } from "@/components/ui/pagination";
import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import { InvoicesStatsCards } from "@/components/invoices/InvoicesStatsCards";
import { InvoicesFilters } from "@/components/invoices/InvoicesFilters";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { useInvoicesPage } from "@/hooks/useInvoicesPage";

const Invoices = () => {
  const {
    invoices,
    filteredInvoices,
    paginatedInvoices,
    statistics,
    isLoading,
    error,
    refetch,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    addDialogOpen,
    setAddDialogOpen,
    viewDialogOpen,
    setViewDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedInvoiceId,
    isEditMode,
    selectedInvoice,
    handleDeleteClick,
    handleDeleteConfirm,
    handleEditClick,
    handleAddNew,
    handleViewInvoice,
  } = useInvoicesPage();

  if (isLoading) {
    return <LoadingState message="جاري تحميل الفواتير..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="فشل تحميل الفواتير" 
        message="حدث خطأ أثناء تحميل بيانات الفواتير"
        onRetry={refetch}
        fullScreen
      />
    );
  }

  return (
    <PageErrorBoundary pageName="الفواتير">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="الفواتير"
          description="إدارة الفواتير والمقبوضات"
          icon={<FileText className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
          actions={
            <div className="flex gap-2">
              <ExportButton
                data={invoices?.map(inv => ({
                  "رقم الفاتورة": inv.invoice_number,
                  "التاريخ": format(new Date(inv.invoice_date), "dd/MM/yyyy"),
                  "العميل": inv.customer_name,
                  "المبلغ الإجمالي": inv.total_amount.toFixed(2),
                  "الضريبة": inv.tax_amount.toFixed(2),
                  "الحالة": inv.status,
                })) || []}
                filename="invoices"
                title="الفواتير"
                headers={["رقم الفاتورة", "التاريخ", "العميل", "المبلغ الإجمالي", "الضريبة", "الحالة"]}
                size="sm"
              />
              <Button size="sm" onClick={handleAddNew}>
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 ms-2" />
                <span className="hidden sm:inline">فاتورة جديدة</span>
                <span className="sm:hidden">جديد</span>
              </Button>
            </div>
          }
        />

        <InvoicesStatsCards stats={statistics} />
        
        <InvoicesFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
        />

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">رقم الفاتورة</TableHead>
                <TableHead className="text-xs sm:text-sm hidden md:table-cell">التاريخ</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">العميل</TableHead>
                <TableHead className="text-center text-xs sm:text-sm">المبلغ</TableHead>
                <TableHead className="text-xs sm:text-sm">الحالة</TableHead>
                <TableHead className="text-left text-xs sm:text-sm">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filteredInvoices || filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Card>
                      <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">لا توجد فواتير بعد</h3>
                        <p className="text-sm text-muted-foreground mb-4">ابدأ بإنشاء أول فاتورة</p>
                        <Button size="sm" onClick={handleAddNew}>
                          <Plus className="h-4 w-4 ms-2" />
                          إنشاء فاتورة
                        </Button>
                      </CardContent>
                    </Card>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-xs sm:text-sm font-semibold">{invoice.invoice_number}</TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                      {format(new Date(invoice.invoice_date), "dd MMM yyyy", { locale: ar })}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{invoice.customer_name}</TableCell>
                    <TableCell className="text-center font-mono text-xs sm:text-sm font-semibold">
                      {Number(invoice.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice.id)}>
                            <Eye className="ms-2 h-4 w-4" /> معاينة
                          </DropdownMenuItem>
                          {invoice.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleEditClick(invoice)}>
                              <Edit className="ms-2 h-4 w-4" /> تعديل
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            disabled={invoice.status === "paid"}
                            onClick={() => handleDeleteClick(invoice.id, invoice.status)}
                          >
                            <Trash2 className="ms-2 h-4 w-4" /> حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            itemsPerPage={itemsPerPage}
            totalItems={filteredInvoices.length}
          />
        )}

        <AddInvoiceDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} isEdit={isEditMode} invoiceToEdit={selectedInvoice} />
        <ViewInvoiceDialog invoiceId={selectedInvoiceId} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          title="حذف الفاتورة"
          description="هل أنت متأكد من حذف هذه الفاتورة؟"
          itemName="الفاتورة"
        />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Invoices;
