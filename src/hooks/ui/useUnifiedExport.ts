/**
 * Unified Export Hook - خطاف تصدير موحد
 * 
 * يجمع جميع أدوات التصدير في مكان واحد:
 * - تصدير PDF (مع دعم الخطوط العربية)
 * - تصدير Excel
 * - تصدير CSV
 * - تصدير متعدد الصفحات
 * - تنسيق البيانات
 * 
 * @version 2.9.74
 */

import { useCallback } from "react";
import { toast } from "sonner";
import { useToast } from "@/hooks/ui/use-toast";
import { logger } from "@/lib/logger";
import { getErrorMessage } from "@/types/errors";
import { loadArabicFontToPDF, addWaqfHeader, addWaqfFooter, getDefaultTableStyles, WAQF_COLORS, processArabicText, processArabicHeaders, processArabicTableData } from "@/lib/pdf/arabic-pdf-utils";
import type { 
  PDFTableData, 
  ExcelRowData, 
  BeneficiaryExport,
  PaymentExport,
  InvoiceExport 
} from "@/types/export";

// ==================== Types ====================

export interface PDFExportConfig {
  title: string;
  filename: string;
  headers: string[];
  data: PDFTableData;
  headerColor?: [number, number, number];
  showDate?: boolean;
}

export interface ExcelExportConfig {
  filename: string;
  data: ExcelRowData[];
  sheetName?: string;
}

export interface MultiSheetExcelConfig {
  filename: string;
  sheets: {
    name: string;
    data: Record<string, unknown>[];
  }[];
}

export interface FinancialStatementConfig {
  title: string;
  filename: string;
  sections: { 
    title: string; 
    items: { label: string; amount: number }[] 
  }[];
  totals: { label: string; amount: number }[];
}

// ==================== Main Hook ====================

export function useUnifiedExport() {
  const { toast: shadcnToast } = useToast();

  /**
   * تصدير إلى PDF مع دعم الخطوط العربية
   */
  const exportToPDF = useCallback(async (config: PDFExportConfig) => {
    try {
      const [jsPDFModule, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      
      const jsPDF = jsPDFModule.default;
      const autoTable = autoTableModule.default;
      
      const doc = new jsPDF();
      
      // تحميل الخط العربي باستخدام النظام الموحد
      const fontName = await loadArabicFontToPDF(doc);

      // إضافة ترويسة الوقف
      let yPos = addWaqfHeader(doc, fontName, config.title);

      // معالجة البيانات للعربية
      const processedHeaders = processArabicHeaders(config.headers);
      const processedData = processArabicTableData(config.data);

      // Table with unified styles
      const tableStyles = getDefaultTableStyles(fontName);
      autoTable(doc, {
        head: [processedHeaders],
        body: processedData,
        startY: yPos,
        ...tableStyles,
        headStyles: {
          ...tableStyles.headStyles,
          fillColor: config.headerColor || WAQF_COLORS.primary,
        },
      });

      // إضافة تذييل الوقف
      addWaqfFooter(doc, fontName);

      doc.save(`${config.filename}.pdf`);

      toast.success("تم التصدير بنجاح", {
        description: `تم تصدير البيانات إلى ${config.filename}.pdf`,
      });
    } catch (error) {
      logger.error(error, { context: 'export_pdf', severity: 'low' });
      toast.error("فشل التصدير", {
        description: getErrorMessage(error),
      });
    }
  }, []);

  /**
   * تصدير إلى Excel (صفحة واحدة)
   */
  const exportToExcel = useCallback(async (config: ExcelExportConfig) => {
    try {
      const { exportToExcel: excelExport } = await import("@/lib/excel-helper");
      
      await excelExport(config.data, config.filename, config.sheetName || "Sheet1");

      toast.success("تم التصدير بنجاح", {
        description: `تم تصدير البيانات إلى ${config.filename}.xlsx`,
      });
    } catch (error) {
      logger.error(error, { context: 'export_excel', severity: 'low' });
      toast.error("فشل التصدير", {
        description: getErrorMessage(error),
      });
    }
  }, []);

  /**
   * تصدير إلى Excel (متعدد الصفحات)
   */
  const exportToMultiSheetExcel = useCallback(async (config: MultiSheetExcelConfig) => {
    try {
      const { exportToExcelMultiSheet } = await import("@/lib/excel-helper");
      
      await exportToExcelMultiSheet(config.sheets, config.filename);

      toast.success("تم التصدير بنجاح", {
        description: `تم تصدير البيانات إلى ${config.filename}`,
      });
    } catch (error) {
      logger.error(error, { context: 'export_multi_sheet_excel', severity: 'low' });
      toast.error("فشل التصدير", {
        description: getErrorMessage(error),
      });
    }
  }, []);

  /**
   * تصدير قائمة مالية إلى PDF مع دعم الخطوط العربية
   */
  const exportFinancialStatement = useCallback(async (config: FinancialStatementConfig) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      // تحميل الخط العربي باستخدام النظام الموحد
      const fontName = await loadArabicFontToPDF(doc);

      // إضافة ترويسة الوقف
      let yPosition = addWaqfHeader(doc, fontName, config.title);

      // Sections
      doc.setFontSize(11);
      config.sections.forEach((section) => {
        doc.setFont(fontName, "bold");
        doc.text(processArabicText(section.title), 20, yPosition);
        yPosition += 7;

        doc.setFont(fontName, "normal");
        section.items.forEach((item) => {
          const amountText = processArabicText(item.amount.toFixed(2));
          doc.text(processArabicText(item.label), 30, yPosition);
          doc.text(amountText, doc.internal.pageSize.width - 30, yPosition, {
            align: "right",
          });
          yPosition += 6;
        });

        yPosition += 5;

        if (yPosition > doc.internal.pageSize.height - 30) {
          doc.addPage();
          yPosition = 20;
        }
      });

      // Totals
      yPosition += 5;
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, doc.internal.pageSize.width - 20, yPosition);
      yPosition += 7;

      doc.setFont(fontName, "bold");
      config.totals.forEach((total) => {
        const amountText = processArabicText(total.amount.toFixed(2));
        doc.text(processArabicText(total.label), 20, yPosition);
        doc.text(amountText, doc.internal.pageSize.width - 30, yPosition, {
          align: "right",
        });
        yPosition += 7;
      });

      // إضافة تذييل الوقف
      addWaqfFooter(doc, fontName);

      doc.save(`${config.filename}.pdf`);

      toast.success("تم التصدير بنجاح", {
        description: `تم تصدير القائمة المالية إلى ${config.filename}.pdf`,
      });
    } catch (error) {
      logger.error(error, { context: 'export_financial_statement', severity: 'low' });
      toast.error("فشل التصدير", {
        description: getErrorMessage(error),
      });
    }
  }, []);

  /**
   * تصدير إلى CSV مع دعم اللغة العربية
   */
  const exportToCSV = useCallback((config: {
    headers: string[];
    rows: (string | number | null | undefined)[][];
    filename: string;
  }) => {
    try {
      const csvContent = [
        config.headers.join(','),
        ...config.rows.map(row => row.map(cell => `"${cell ?? ''}"`).join(','))
      ].join('\n');
      
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${config.filename}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success("تم التصدير بنجاح", {
        description: `تم تصدير البيانات إلى ${config.filename}.csv`,
      });
    } catch (error) {
      logger.error(error, { context: 'export_csv', severity: 'low' });
      toast.error("فشل التصدير", {
        description: getErrorMessage(error),
      });
    }
  }, []);

  return {
    exportToPDF,
    exportToExcel,
    exportToMultiSheetExcel,
    exportFinancialStatement,
    exportToCSV,
  };
}

// ==================== Data Formatters ====================

/**
 * تنسيق بيانات المستفيدين للتصدير
 */
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

/**
 * تنسيق بيانات المدفوعات للتصدير
 */
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

/**
 * تنسيق بيانات الفواتير للتصدير
 */
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

/**
 * تنسيق بيانات الإفصاح السنوي للتصدير
 */
export function formatDisclosureForExport(disclosure: {
  year: number;
  waqf_name: string;
  total_revenues: number | null;
  total_expenses: number | null;
  net_income: number | null;
  nazer_share: number | null;
  nazer_percentage: number;
  charity_share: number | null;
  charity_percentage: number;
  corpus_share: number | null;
  corpus_percentage: number;
  total_beneficiaries: number | null;
  sons_count: number | null;
  daughters_count: number | null;
  wives_count: number | null;
  disclosure_date: string;
  status: string | null;
}) {
  return {
    'السنة المالية': disclosure.year,
    'اسم الوقف': disclosure.waqf_name,
    'إجمالي الإيرادات': disclosure.total_revenues?.toLocaleString() || '0',
    'إجمالي المصروفات': disclosure.total_expenses?.toLocaleString() || '0',
    'صافي الدخل': disclosure.net_income?.toLocaleString() || '0',
    'حصة الناظر': disclosure.nazer_share?.toLocaleString() || '0',
    'نسبة الناظر': `${disclosure.nazer_percentage}%`,
    'حصة البر': disclosure.charity_share?.toLocaleString() || '0',
    'نسبة البر': `${disclosure.charity_percentage}%`,
    'حصة ريع الوقف': disclosure.corpus_share?.toLocaleString() || '0',
    'نسبة ريع الوقف': `${disclosure.corpus_percentage}%`,
    'عدد المستفيدين': disclosure.total_beneficiaries || 0,
    'عدد الأبناء': disclosure.sons_count || 0,
    'عدد البنات': disclosure.daughters_count || 0,
    'عدد الزوجات': disclosure.wives_count || 0,
    'تاريخ الإفصاح': disclosure.disclosure_date,
    'الحالة': disclosure.status,
  };
}

/**
 * تنسيق بيانات العقارات للتصدير
 */
export function formatPropertiesForExport(properties: {
  name: string;
  type: string;
  address: string | null;
  status: string;
  total_units?: number;
  occupied_units?: number;
  monthly_revenue?: number;
}[]): ExcelRowData[] {
  return properties.map((p) => ({
    "اسم العقار": p.name,
    "النوع": p.type,
    "العنوان": p.address || "-",
    "الحالة": p.status,
    "عدد الوحدات": p.total_units || 0,
    "الوحدات المؤجرة": p.occupied_units || 0,
    "الإيراد الشهري": p.monthly_revenue || 0,
  }));
}

/**
 * تنسيق بيانات العقود للتصدير
 */
export function formatContractsForExport(contracts: {
  contract_number: string;
  tenant_name: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  status: string;
  property_name?: string;
}[]): ExcelRowData[] {
  return contracts.map((c) => ({
    "رقم العقد": c.contract_number,
    "المستأجر": c.tenant_name,
    "تاريخ البداية": c.start_date,
    "تاريخ النهاية": c.end_date,
    "الإيجار الشهري": c.monthly_rent,
    "العقار": c.property_name || "-",
    "الحالة": c.status,
  }));
}

export default useUnifiedExport;
