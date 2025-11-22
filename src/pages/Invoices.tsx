import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, Trash2, MoreVertical, DollarSign, Clock, AlertTriangle, FileText } from "lucide-react";
import { AddInvoiceDialog } from "@/components/invoices/AddInvoiceDialog";
import { ViewInvoiceDialog } from "@/components/invoices/ViewInvoiceDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ExportButton } from "@/components/shared/ExportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Pagination } from "@/components/ui/pagination";
import { useInvoices } from "@/hooks/useInvoices";
import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { toast } from "sonner";

type Invoice = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
  tax_amount: number;
  status: string;
};

const ITEMS_PER_PAGE = 20;

const Invoices = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { invoices, isLoading, deleteInvoice } = useInvoices();

  // Statistics
  const statistics = useMemo(() => {
    if (!invoices) return {
      totalSales: 0,
      paidCount: 0,
      pendingCount: 0,
      overdueAmount: 0,
      overdueCount: 0,
      totalCount: 0
    };

    return {
      totalSales: invoices
        .filter(i => i.status === "paid")
        .reduce((sum, i) => sum + i.total_amount, 0),
      
      paidCount: invoices.filter(i => i.status === "paid").length,
      
      pendingCount: invoices.filter(i => 
        i.status === "sent" || i.status === "draft"
      ).length,
      
      overdueAmount: invoices
        .filter(i => i.status === "overdue")
        .reduce((sum, i) => sum + i.total_amount, 0),
      
      overdueCount: invoices.filter(i => i.status === "overdue").length,
      
      totalCount: invoices.length
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      
      const matchesDateRange = 
        (!dateFrom || invoice.invoice_date >= dateFrom) &&
        (!dateTo || invoice.invoice_date <= dateTo);
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [invoices, searchQuery, statusFilter, dateFrom, dateTo]);

  // Paginated invoices
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredInvoices.slice(startIndex, endIndex);
  }, [filteredInvoices, currentPage]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);

  const handleDeleteClick = (invoiceId: string, status: string) => {
    if (status === "paid") {
      toast.error("لا يمكن حذف فاتورة مدفوعة");
      return;
    }
    setInvoiceToDelete(invoiceId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (invoiceToDelete) {
      await deleteInvoice(invoiceToDelete);
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleEditClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditMode(true);
    setAddDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 md:p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
                "البريد": inv.customer_email || "",
                "الهاتف": inv.customer_phone || ""
              })) || []}
              filename="invoices"
              title="الفواتير"
              headers={[
                "رقم الفاتورة",
                "التاريخ",
                "العميل",
                "المبلغ الإجمالي",
                "الضريبة",
                "الحالة",
                "البريد",
                "الهاتف"
              ]}
              size="sm"
            />
            <Button size="sm" onClick={() => {
              setIsEditMode(false);
              setSelectedInvoice(null);
              setAddDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              <span className="hidden sm:inline">فاتورة جديدة</span>
              <span className="sm:hidden">جديد</span>
            </Button>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.totalSales.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.paidCount} فاتورة مدفوعة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المعلقة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">بانتظار الدفع</p>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المتأخرات</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {statistics.overdueAmount.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.overdueCount} فاتورة متأخرة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">فاتورة مسجلة</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="بحث برقم الفاتورة أو اسم العميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="sent">مرسلة</SelectItem>
                <SelectItem value="paid">مدفوعة</SelectItem>
                <SelectItem value="overdue">متأخرة</SelectItem>
                <SelectItem value="cancelled">ملغاة</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="من تاريخ"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              type="date"
              placeholder="إلى تاريخ"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

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
                      <p className="text-sm text-muted-foreground mb-4">
                        ابدأ بإنشاء أول فاتورة لتتبع المقبوضات والمبيعات
                      </p>
                      <Button size="sm" onClick={() => setAddDialogOpen(true)}>
                        <Plus className="h-4 w-4 ml-2" />
                        إنشاء فاتورة
                      </Button>
                    </CardContent>
                  </Card>
                </TableCell>
              </TableRow>
            ) : (
              paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-xs sm:text-sm font-semibold">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                    {format(new Date(invoice.invoice_date), "dd MMM yyyy", {
                      locale: ar,
                    })}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                    {invoice.customer_name}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs sm:text-sm font-semibold">
                    {Number(invoice.total_amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedInvoiceId(invoice.id);
                          setViewDialogOpen(true);
                        }}>
                          <Eye className="ml-2 h-4 w-4" /> معاينة
                        </DropdownMenuItem>
                        {invoice.status === "draft" && (
                          <DropdownMenuItem onClick={() => handleEditClick(invoice)}>
                            <Edit className="ml-2 h-4 w-4" /> تعديل
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={invoice.status === "paid"}
                          onClick={() => handleDeleteClick(invoice.id, invoice.status)}
                        >
                          <Trash2 className="ml-2 h-4 w-4" /> حذف
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
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredInvoices.length}
        />
      )}

      <AddInvoiceDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
        isEdit={isEditMode}
        invoiceToEdit={selectedInvoice}
      />
      <ViewInvoiceDialog 
        invoiceId={selectedInvoiceId} 
        open={viewDialogOpen} 
        onOpenChange={setViewDialogOpen} 
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="حذف الفاتورة"
        description="هل أنت متأكد من حذف هذه الفاتورة؟ سيتم حذف القيد المحاسبي المرتبط بها."
        itemName="الفاتورة"
      />
    </MobileOptimizedLayout>
  );
};

export default Invoices;
