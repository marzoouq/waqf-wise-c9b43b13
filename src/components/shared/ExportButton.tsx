import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Printer } from "lucide-react";
import { toast } from "@/hooks/ui/use-toast";

interface ExportButtonProps<T extends object> {
  data: T[];
  filename: string;
  title: string;
  headers: string[];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const ExportButton = <T extends object>({
  data,
  filename,
  title,
  headers,
  variant = "outline",
  size = "sm",
  className,
}: ExportButtonProps<T>) => {
  // استخراج البيانات من الكائنات بناءً على مفاتيح الـ headers
  const extractDataForExport = () => {
    return data.map(item => {
      const record = item as Record<string, unknown>;
      // البحث عن القيم باستخدام المفاتيح العربية (headers)
      return headers.map(header => {
        const value = record[header];
        if (value === null || value === undefined) return "-";
        if (typeof value === "boolean") return value ? "نعم" : "لا";
        return String(value);
      });
    });
  };

  // ✅ Dynamic import - يُحمّل فقط عند الضغط على زر التصدير
  const handleExportPDF = async () => {
    try {
      const { exportToPDF } = await import("@/lib/exportHelpers");
      const tableData = extractDataForExport();
      await exportToPDF(title, headers, tableData, filename);
      toast({
        title: "تم التصدير",
        description: "تم تصدير البيانات إلى PDF بنجاح",
      });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast({
        title: "خطأ",
        description: "فشل تصدير البيانات",
        variant: "destructive",
      });
    }
  };

  // ✅ Dynamic import - يُحمّل فقط عند الضغط على زر التصدير
  const handleExportExcel = async () => {
    try {
      const { exportToExcel } = await import("@/lib/exportHelpers");
      // Safe cast - T extends object so it's compatible with Record
      await exportToExcel(data as unknown as Record<string, unknown>[], filename, title);
      toast({
        title: "تم التصدير",
        description: "تم تصدير البيانات إلى Excel بنجاح",
      });
    } catch (error) {
      console.error("Excel Export Error:", error);
      toast({
        title: "خطأ",
        description: "فشل تصدير البيانات",
        variant: "destructive",
      });
    }
  };

  // طباعة البيانات مباشرة
  const handlePrint = () => {
    const tableData = extractDataForExport();
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "خطأ",
        description: "يرجى السماح بالنوافذ المنبثقة للطباعة",
        variant: "destructive",
      });
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          body { font-family: 'Cairo', sans-serif; padding: 20px; direction: rtl; }
          h1 { text-align: center; color: #1a5f7a; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
          th { background-color: #1a5f7a; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header { text-align: center; margin-bottom: 30px; }
          .date { text-align: center; color: #666; margin-bottom: 20px; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p class="date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${tableData.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    toast({
      title: "جاري الطباعة",
      description: "تم فتح نافذة الطباعة",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Download className="h-4 w-4 ms-2" />
          تصدير
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="h-4 w-4 ms-2" />
          تصدير PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="h-4 w-4 ms-2" />
          تصدير Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="h-4 w-4 ms-2" />
          طباعة
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
