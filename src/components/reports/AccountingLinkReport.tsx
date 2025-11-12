import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Link2, AlertCircle, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import jsPDF from "jspdf";
import "jspdf-autotable";

export function AccountingLinkReport() {
  const [activeTab, setActiveTab] = useState("linked");

  // جلب العمليات المالية المرتبطة بالقيود
  const { data: linkedOperations = [], isLoading: isLoadingLinked } = useQuery({
    queryKey: ["accounting-link", "linked"],
    queryFn: async () => {
      const operations = [];

      // سندات القبض والصرف
      const { data: payments } = await supabase
        .from("payments")
        .select("*, journal_entries:journal_entry_id(*)")
        .not("journal_entry_id", "is", null);
      
      if (payments) {
        operations.push(...payments.map(p => ({
          id: p.id,
          type: "سند",
          number: p.payment_number,
          description: p.description,
          amount: p.amount,
          date: p.payment_date,
          journalEntry: p.journal_entries?.entry_number,
          journalEntryId: p.journal_entry_id,
        })));
      }

      // دفعات الإيجار
      const { data: rentals } = await supabase
        .from("rental_payments")
        .select("*, journal_entries:journal_entry_id(*), contracts(contract_number)")
        .not("journal_entry_id", "is", null);
      
      if (rentals) {
        operations.push(...rentals.map(r => ({
          id: r.id,
          type: "إيجار",
          number: r.payment_number,
          description: `دفعة إيجار - عقد ${r.contracts?.contract_number}`,
          amount: r.amount_paid,
          date: r.payment_date,
          journalEntry: r.journal_entries?.entry_number,
          journalEntryId: r.journal_entry_id,
        })));
      }

      // الفواتير
      const { data: invoices } = await supabase
        .from("invoices")
        .select("*, journal_entries:journal_entry_id(*)")
        .not("journal_entry_id", "is", null);
      
      if (invoices) {
        operations.push(...invoices.map(i => ({
          id: i.id,
          type: "فاتورة",
          number: i.invoice_number,
          description: `فاتورة - ${i.customer_name}`,
          amount: i.total_amount,
          date: i.invoice_date,
          journalEntry: i.journal_entries?.entry_number,
          journalEntryId: i.journal_entry_id,
        })));
      }

      // التوزيعات
      const { data: distributions } = await supabase
        .from("distributions")
        .select("*, journal_entries:journal_entry_id(*)")
        .not("journal_entry_id", "is", null);
      
      if (distributions) {
        operations.push(...distributions.map(d => ({
          id: d.id,
          type: "توزيع",
          number: d.month,
          description: `توزيع ${d.month}`,
          amount: d.total_amount,
          date: d.distribution_date,
          journalEntry: d.journal_entries?.entry_number,
          journalEntryId: d.journal_entry_id,
        })));
      }

      // طلبات الصيانة
      const { data: maintenance } = await supabase
        .from("maintenance_requests")
        .select("*, journal_entries:journal_entry_id(*)")
        .not("journal_entry_id", "is", null);
      
      if (maintenance) {
        operations.push(...maintenance.map(m => ({
          id: m.id,
          type: "صيانة",
          number: m.request_number,
          description: m.title,
          amount: m.actual_cost || 0,
          date: m.completed_date,
          journalEntry: m.journal_entries?.entry_number,
          journalEntryId: m.journal_entry_id,
        })));
      }

      return operations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  });

  // جلب العمليات غير المرتبطة
  const { data: unlinkedOperations = [], isLoading: isLoadingUnlinked } = useQuery({
    queryKey: ["accounting-link", "unlinked"],
    queryFn: async () => {
      const operations = [];

      // سندات القبض والصرف غير المرتبطة
      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .is("journal_entry_id", null)
        .gte("amount", 0);
      
      if (payments) {
        operations.push(...payments.map(p => ({
          id: p.id,
          type: "سند",
          number: p.payment_number,
          description: p.description,
          amount: p.amount,
          date: p.payment_date,
          reason: "لم يتم إنشاء قيد محاسبي تلقائياً",
        })));
      }

      return operations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // إعداد الخط العربي
    doc.setLanguage("ar");
    
    doc.text("تقرير ربط العمليات المحاسبية", 105, 20, { align: "center" });
    doc.text(`التاريخ: ${format(new Date(), "dd MMMM yyyy", { locale: ar })}`, 105, 30, { align: "center" });

    const tableData = linkedOperations.map(op => [
      op.type,
      op.number,
      op.description,
      `${op.amount.toLocaleString()} ر.س`,
      format(new Date(op.date), "yyyy-MM-dd"),
      op.journalEntry || "-",
    ]);

    (doc as any).autoTable({
      head: [["النوع", "الرقم", "الوصف", "المبلغ", "التاريخ", "رقم القيد"]],
      body: tableData,
      startY: 40,
      styles: { font: "helvetica", halign: "right" },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`accounting-link-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                تقرير الربط المحاسبي
              </CardTitle>
              <CardDescription>
                تتبع ربط العمليات المالية بالقيود المحاسبية
              </CardDescription>
            </div>
            <Button onClick={exportToPDF} variant="outline">
              <Download className="h-4 w-4 ml-2" />
              تصدير PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="linked" className="gap-2">
                <Link2 className="h-4 w-4" />
                عمليات مرتبطة ({linkedOperations.length})
              </TabsTrigger>
              <TabsTrigger value="unlinked" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                عمليات غير مرتبطة ({unlinkedOperations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="linked" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>النوع</TableHead>
                    <TableHead>الرقم</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>رقم القيد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedOperations.map((op) => (
                    <TableRow key={`${op.type}-${op.id}`}>
                      <TableCell>
                        <Badge variant="outline">{op.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">{op.number}</TableCell>
                      <TableCell>{op.description}</TableCell>
                      <TableCell className="font-semibold">
                        {op.amount.toLocaleString()} ر.س
                      </TableCell>
                      <TableCell>
                        {format(new Date(op.date), "dd MMM yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{op.journalEntry}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="unlinked" className="space-y-4">
              {unlinkedOperations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>النوع</TableHead>
                      <TableHead>الرقم</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>السبب</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unlinkedOperations.map((op) => (
                      <TableRow key={`${op.type}-${op.id}`}>
                        <TableCell>
                          <Badge variant="outline">{op.type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{op.number}</TableCell>
                        <TableCell>{op.description}</TableCell>
                        <TableCell className="font-semibold">
                          {op.amount.toLocaleString()} ر.س
                        </TableCell>
                        <TableCell>
                          {format(new Date(op.date), "dd MMM yyyy", { locale: ar })}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {op.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Card className="bg-green-50 dark:bg-green-900/10 border-green-200">
                  <CardContent className="p-6 text-center">
                    <p className="text-green-700 dark:text-green-400 font-semibold">
                      ✓ جميع العمليات المالية مرتبطة بقيود محاسبية
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
