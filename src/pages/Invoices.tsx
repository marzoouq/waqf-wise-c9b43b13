import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Eye, FileText } from "lucide-react";
import { AddInvoiceDialog } from "@/components/invoices/AddInvoiceDialog";
import { ViewInvoiceDialog } from "@/components/invoices/ViewInvoiceDialog";
import { Badge } from "@/components/ui/badge";
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

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, invoice_date, customer_name, total_amount, status")
        .order("invoice_date", { ascending: false });
      if (error) throw error;
      return data as Invoice[];
    },
    staleTime: 3 * 60 * 1000,
  });

  // Paginate invoices
  const paginatedInvoices = useMemo(() => {
    if (!invoices) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return invoices.slice(startIndex, endIndex);
  }, [invoices, currentPage]);

  const totalPages = Math.ceil((invoices?.length || 0) / ITEMS_PER_PAGE);

  const getStatusBadge = useCallback((status: string) => {
    const variants: Record<string, { label: string; variant: any }> = {
      draft: { label: "مسودة", variant: "secondary" },
      sent: { label: "مرسلة", variant: "default" },
      paid: { label: "مدفوعة", variant: "default" },
      cancelled: { label: "ملغاة", variant: "destructive" },
    };
    const config = variants[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }, []);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary">
              الفواتير
            </h1>
            <p className="text-muted-foreground mt-1">إدارة الفواتير والمقبوضات</p>
          </div>
          <Button size="sm" className="w-full sm:w-auto" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 ml-2" />
            فاتورة جديدة
          </Button>
        </div>

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
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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
      </div>
    </div>
  );
};

export default Invoices;
