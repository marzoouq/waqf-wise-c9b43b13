import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Eye, FileText } from "lucide-react";
import { AddInvoiceDialog } from "@/components/invoices/AddInvoiceDialog";
import { ViewInvoiceDialog } from "@/components/invoices/ViewInvoiceDialog";
import { Card, CardContent } from "@/components/ui/card";
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

type Invoice = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  total_amount: number;
  status: string;
};

const ITEMS_PER_PAGE = 20;

const Invoices = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { invoices, isLoading } = useInvoices();

  // Paginate invoices
  const paginatedInvoices = useMemo(() => {
    if (!invoices) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return invoices.slice(startIndex, endIndex);
  }, [invoices, currentPage]);

  const totalPages = Math.ceil((invoices?.length || 0) / ITEMS_PER_PAGE);

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
          <Button size="sm" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
            <span className="hidden sm:inline">فاتورة جديدة</span>
            <span className="sm:hidden">جديد</span>
          </Button>
        }
      />

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead className="hidden sm:table-cell">العميل</TableHead>
                <TableHead className="text-center">المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!invoices || invoices.length === 0 ? (
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
                    <TableCell className="font-mono text-sm font-semibold">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(invoice.invoice_date), "dd MMM yyyy", {
                        locale: ar,
                      })}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {invoice.customer_name}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm font-semibold">
                      {Number(invoice.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell><InvoiceStatusBadge status={invoice.status} /></TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedInvoiceId(invoice.id);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
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
            totalItems={invoices?.length || 0}
          />
        )}

        <AddInvoiceDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
        <ViewInvoiceDialog 
          invoiceId={selectedInvoiceId} 
          open={viewDialogOpen} 
          onOpenChange={setViewDialogOpen} 
        />
    </MobileOptimizedLayout>
  );
};

export default Invoices;
