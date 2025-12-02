import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF, exportToExcel } from "@/lib/exportHelpers";
import { 
  PDFTableData, 
  ExcelRowData, 
  BeneficiaryExport,
  PaymentExport,
  InvoiceExport 
} from "@/types/export";
import { getErrorMessage } from "@/types/errors";

interface ExportOptions {
  format: "pdf" | "excel";
  filename: string;
}

interface PDFExportOptions extends ExportOptions {
  format: "pdf";
  title: string;
  headers: string[];
  data: PDFTableData;
}

interface ExcelExportOptions extends ExportOptions {
  format: "excel";
  data: ExcelRowData[];
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
    } catch (error: unknown) {
      toast({
        title: "خطأ في التصدير",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  }, [toast]);

  return { exportData };
}

// Helper functions to format data for export
export function formatBeneficiariesForExport(beneficiaries: BeneficiaryExport[]): ExcelRowData[] {
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


export function formatPaymentsForExport(payments: PaymentExport[]): ExcelRowData[] {
  return payments.map((p) => ({
    "رقم السند": p.payment_number,
    "التاريخ": p.payment_date,
    "المبلغ": p.amount,
    "طريقة الدفع": p.payment_method || "-",
    "اسم المستفيد": p.beneficiary_name || "-",
    "البيان": p.description || "-",
    "الحالة": p.status,
  }));
}

export function formatInvoicesForExport(invoices: InvoiceExport[]): ExcelRowData[] {
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
