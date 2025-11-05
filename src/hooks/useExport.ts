import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF, exportToExcel } from "@/lib/exportHelpers";

interface ExportOptions {
  format: "pdf" | "excel";
  filename: string;
}

interface PDFExportOptions extends ExportOptions {
  format: "pdf";
  title: string;
  headers: string[];
  data: any[][];
}

interface ExcelExportOptions extends ExportOptions {
  format: "excel";
  data: any[];
  sheetName?: string;
}

export function useExport() {
  const { toast } = useToast();

  const exportData = useCallback((options: PDFExportOptions | ExcelExportOptions) => {
    try {
      if (options.format === "pdf") {
        const { title, headers, data, filename } = options as PDFExportOptions;
        exportToPDF(title, headers, data, filename);
      } else {
        const { data, filename, sheetName } = options as ExcelExportOptions;
        exportToExcel(data, filename, sheetName);
      }

      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير البيانات إلى ${options.format === "pdf" ? "PDF" : "Excel"}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive",
      });
    }
  }, [toast]);

  return { exportData };
}

// Helper functions to format data for export
export function formatBeneficiariesForExport(beneficiaries: any[]) {
  return beneficiaries.map((b) => ({
    "الاسم الكامل": b.full_name,
    "رقم الهوية": b.national_id,
    "الهاتف": b.phone,
    "البريد الإلكتروني": b.email || "-",
    "الفئة": b.category,
    "الحالة": b.status,
    "ملاحظات": b.notes || "-",
  }));
}

export function formatPropertiesForExport(properties: any[]) {
  return properties.map((p) => ({
    "اسم العقار": p.name,
    "النوع": p.type,
    "الموقع": p.location,
    "عدد الوحدات": p.units,
    "المؤجرة": p.occupied,
    "الإيرادات الشهرية": p.monthly_revenue,
    "الحالة": p.status,
  }));
}

export function formatPaymentsForExport(payments: any[]) {
  return payments.map((p) => ({
    "رقم السند": p.payment_number,
    "التاريخ": p.payment_date,
    "النوع": p.payment_type === "receipt" ? "قبض" : "صرف",
    "المبلغ": p.amount,
    "طريقة الدفع": p.payment_method,
    "الدافع": p.payer_name,
    "البيان": p.description,
  }));
}

export function formatInvoicesForExport(invoices: any[]) {
  return invoices.map((i) => ({
    "رقم الفاتورة": i.invoice_number,
    "التاريخ": i.invoice_date,
    "العميل": i.customer_name,
    "المبلغ الإجمالي": i.total_amount,
    "الضريبة": i.tax_amount,
    "الصافي": i.subtotal,
    "الحالة": i.status,
  }));
}
