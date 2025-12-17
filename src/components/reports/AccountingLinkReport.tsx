import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Link2, AlertCircle, FileText } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { useAccountingLinkReport } from "@/hooks/reports/useAccountingLinkReport";
import { loadArabicFontToPDF, addWaqfHeader, addWaqfFooter, getDefaultTableStyles } from "@/lib/pdf/arabic-pdf-utils";

export function AccountingLinkReport() {
  const [activeTab, setActiveTab] = useState("linked");
  const { linkedOperations, unlinkedOperations, isLoadingLinked, isLoadingUnlinked } = useAccountingLinkReport();

  const exportToPDF = async () => {
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    
    const jsPDF = jsPDFModule.default;
    const autoTable = autoTableModule.default;
    const doc = new jsPDF();
    
    // تحميل الخط العربي
    const fontName = await loadArabicFontToPDF(doc);
    
    // إضافة ترويسة الوقف
    const startY = addWaqfHeader(doc, fontName, 'تقرير ربط العمليات المحاسبية');

    const tableData = linkedOperations.map(op => [
      op.type,
      op.number,
      op.description,
      `${op.amount.toLocaleString()} ر.س`,
      format(new Date(op.date), "yyyy-MM-dd"),
      op.journalEntry || "-",
    ]);

    const tableStyles = getDefaultTableStyles(fontName);

    autoTable(doc, {
      head: [["النوع", "الرقم", "الوصف", "المبلغ", "التاريخ", "رقم القيد"]],
      body: tableData,
      startY: startY,
      ...tableStyles,
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        font: fontName,
      },
      margin: { bottom: 30 },
      didDrawPage: () => {
        addWaqfFooter(doc, fontName);
      },
    });

    doc.save(`تقرير-الربط-المحاسبي-${format(new Date(), "yyyy-MM-dd")}.pdf`);
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
              <Download className="h-4 w-4 ms-2" />
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">النوع</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">الرقم</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">الوصف</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">المبلغ</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">التاريخ</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">رقم القيد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linkedOperations.map((op) => (
                      <TableRow key={`${op.type}-${op.id}`}>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant="outline">{op.type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs sm:text-sm whitespace-nowrap">{op.number}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">{op.description}</TableCell>
                        <TableCell className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                          {op.amount.toLocaleString()} ر.س
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                          {format(new Date(op.date), "dd MMM yyyy", { locale: ar })}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="font-mono text-xs sm:text-sm">{op.journalEntry}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="unlinked" className="space-y-4">
              {unlinkedOperations.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">النوع</TableHead>
                        <TableHead className="text-xs sm:text-sm whitespace-nowrap">الرقم</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden md:table-cell">الوصف</TableHead>
                        <TableHead className="text-xs sm:text-sm whitespace-nowrap">المبلغ</TableHead>
                        <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">التاريخ</TableHead>
                        <TableHead className="text-xs sm:text-sm">السبب</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unlinkedOperations.map((op) => (
                        <TableRow key={`${op.type}-${op.id}`}>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge variant="outline">{op.type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs sm:text-sm whitespace-nowrap">{op.number}</TableCell>
                          <TableCell className="text-xs sm:text-sm hidden md:table-cell">{op.description}</TableCell>
                          <TableCell className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                            {op.amount.toLocaleString()} ر.س
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                            {format(new Date(op.date), "dd MMM yyyy", { locale: ar })}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs sm:text-sm">
                            {op.reason}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Card className="bg-success-light dark:bg-success/10 border-success/30">
                  <CardContent className="pt-4">
                    <p className="text-success font-semibold">
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
