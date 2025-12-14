import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { exportToPDF, exportToExcel } from "@/lib/exportHelpers";

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
  const handleExportPDF = () => {
    try {
      const tableData = data.map(item => 
        headers.map(header => String((item as Record<string, unknown>)[header] ?? "-"))
      );
      exportToPDF(title, headers, tableData, `${filename}.pdf`);
      toast({
        title: "تم التصدير",
        description: "تم تصدير البيانات إلى PDF بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تصدير البيانات",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    try {
      // Safe cast - T extends object so it's compatible with Record
      exportToExcel(data as unknown as Record<string, unknown>[], `${filename}.xlsx`, title);
      toast({
        title: "تم التصدير",
        description: "تم تصدير البيانات إلى Excel بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تصدير البيانات",
        variant: "destructive",
      });
    }
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
