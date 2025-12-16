import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  X,
  BarChart3,
  Clock
} from "lucide-react";
import { format } from "@/lib/date";
import type { ReportResult } from "@/hooks/reports/useCustomReports";

interface ReportResultsPreviewProps {
  result: ReportResult;
  reportName: string;
  onClose: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
}

export function ReportResultsPreview({
  result,
  reportName,
  onClose,
  onExportPDF,
  onExportExcel,
  onExportCSV,
}: ReportResultsPreviewProps) {
  const formatCellValue = (value: unknown, key: string): string => {
    if (value === null || value === undefined) return '—';
    
    // تنسيق التواريخ
    if (key.includes('date') || key.includes('_at')) {
      try {
        return format(new Date(value as string), 'dd/MM/yyyy');
      } catch {
        return String(value);
      }
    }
    
    // تنسيق المبالغ
    if (key.includes('amount') || key.includes('balance') || key.includes('rent') || key.includes('payment') || key.includes('value') || key.includes('received')) {
      const num = Number(value);
      if (!isNaN(num)) {
        return new Intl.NumberFormat('ar-SA', {
          style: 'currency',
          currency: 'SAR',
          maximumFractionDigits: 0,
        }).format(num);
      }
    }
    
    return String(value);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">{reportName || 'معاينة التقرير'}</CardTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>تم التوليد: {format(new Date(result.generatedAt), 'dd/MM/yyyy HH:mm')}</span>
                <Badge variant="secondary">{result.totalCount} سجل</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={onExportPDF}>
              <FileText className="h-4 w-4 ms-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onExportExcel}>
              <FileSpreadsheet className="h-4 w-4 ms-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={onExportCSV}>
              <Download className="h-4 w-4 ms-2" />
              CSV
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {result.data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد بيانات تطابق معايير التقرير</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  {result.columns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    {result.columns.map((col) => (
                      <TableCell key={col.key}>
                        {formatCellValue(row[col.key], col.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
        
        {/* ملخص التقرير */}
        {result.data.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
            <span>إجمالي السجلات: {result.totalCount}</span>
            <span>عدد الأعمدة: {result.columns.length}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
