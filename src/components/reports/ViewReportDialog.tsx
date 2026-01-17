/**
 * Dialog لعرض التقرير المخصص
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReportResult, CustomReportTemplate } from "@/services/report.service";

interface ViewReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: CustomReportTemplate | null;
  executeReport: (template: CustomReportTemplate) => Promise<ReportResult>;
  onDownload: (template: CustomReportTemplate, format: "excel" | "pdf") => void;
}

export function ViewReportDialog({
  open,
  onOpenChange,
  template,
  executeReport,
  onDownload,
}: ViewReportDialogProps) {
  const [result, setResult] = useState<ReportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && template) {
      loadReport();
    } else {
      setResult(null);
      setError(null);
    }
  }, [open, template]);

  const loadReport = async () => {
    if (!template) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await executeReport(template);
      setResult(data);
    } catch (err) {
      setError("حدث خطأ أثناء تحميل التقرير");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{template?.name || "عرض التقرير"}</span>
            {result && template && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(template, "excel")}
                >
                  <FileSpreadsheet className="h-4 w-4 me-1" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(template, "pdf")}
                >
                  <FileText className="h-4 w-4 me-1" />
                  PDF
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ms-2">جاري تحميل التقرير...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
              <Button variant="outline" onClick={loadReport} className="mt-4">
                إعادة المحاولة
              </Button>
            </div>
          ) : result ? (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                إجمالي السجلات: {result.totalCount} | تم العرض: {result.total}
              </div>
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {result.columns.map((col) => (
                        <TableHead key={col.key}>{col.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.data.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={result.columns.length}
                          className="text-center py-8 text-muted-foreground"
                        >
                          لا توجد بيانات
                        </TableCell>
                      </TableRow>
                    ) : (
                      result.data.map((row, idx) => (
                        <TableRow key={idx}>
                          {result.columns.map((col) => (
                            <TableCell key={col.key}>
                              {formatCellValue(row[col.key])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  if (typeof value === "number") {
    return value.toLocaleString("ar-SA");
  }
  if (typeof value === "string") {
    // Check if it's a date
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        return new Date(value).toLocaleDateString("ar-SA");
      } catch {
        return value;
      }
    }
    return value;
  }
  return String(value);
}
