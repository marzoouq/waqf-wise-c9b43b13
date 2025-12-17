/**
 * Export Helpers - أدوات التصدير الموحدة مع هوية الوقف
 * تدعم الخطوط العربية (Amiri) في جميع ملفات PDF
 * 
 * @version 2.9.42
 */

import { logger } from "./logger";
import { loadArabicFontToPDF, addWaqfHeader, addWaqfFooter, getDefaultTableStyles, WAQF_COLORS } from "./pdf/arabic-pdf-utils";

export const exportToPDF = async (
  title: string,
  headers: string[],
  data: (string | number | boolean | null | undefined)[][],
  filename: string
) => {
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
  const startY = addWaqfHeader(doc, fontName, title);

  // الجدول مع الأنماط الموحدة
  const tableStyles = getDefaultTableStyles(fontName);
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: startY,
    ...tableStyles,
    margin: { bottom: 30 },
    didDrawPage: () => {
      addWaqfFooter(doc, fontName);
    },
  });

  doc.save(`${filename}.pdf`);
};

export const exportToExcel = async (
  data: Record<string, unknown>[],
  filename: string,
  sheetName: string = "Sheet1"
) => {
  const { exportToExcel: excelExport } = await import("@/lib/excel-helper");
  await excelExport(data, filename, sheetName);
};

/**
 * تصدير البيانات إلى CSV مع دعم اللغة العربية
 */
export const exportToCSV = (
  headers: string[],
  rows: (string | number | null | undefined)[][],
  filename: string
) => {
  // إنشاء محتوى CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell ?? ''}"`).join(','))
  ].join('\n');
  
  // إضافة BOM للدعم العربي
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // تحميل الملف
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportFinancialStatementToPDF = async (
  title: string,
  sections: { title: string; items: { label: string; amount: number }[] }[],
  totals: { label: string; amount: number }[],
  filename: string
) => {
  const { default: jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  
  // تحميل الخط العربي باستخدام النظام الموحد
  const fontName = await loadArabicFontToPDF(doc);

  // إضافة ترويسة الوقف
  let yPosition = addWaqfHeader(doc, fontName, title);
  yPosition += 5;

  // الأقسام
  doc.setFontSize(11);
  sections.forEach((section) => {
    // عنوان القسم
    doc.setFont(fontName, "bold");
    doc.setTextColor(...WAQF_COLORS.primary);
    doc.text(section.title, 20, yPosition);
    yPosition += 7;

    // عناصر القسم
    doc.setFont(fontName, "normal");
    doc.setTextColor(...WAQF_COLORS.text);
    section.items.forEach((item) => {
      const amountText = item.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
      doc.text(item.label, 30, yPosition);
      doc.text(amountText, doc.internal.pageSize.width - 30, yPosition, {
        align: "right",
      });
      yPosition += 6;
    });

    yPosition += 5;

    // التحقق من الحاجة لصفحة جديدة
    if (yPosition > doc.internal.pageSize.height - 50) {
      addWaqfFooter(doc, fontName);
      doc.addPage();
      yPosition = 20;
    }
  });

  // المجاميع
  yPosition += 5;
  doc.setDrawColor(...WAQF_COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, doc.internal.pageSize.width - 20, yPosition);
  yPosition += 7;

  doc.setFont(fontName, "bold");
  doc.setTextColor(...WAQF_COLORS.primary);
  totals.forEach((total) => {
    const amountText = total.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    doc.text(total.label, 20, yPosition);
    doc.text(amountText, doc.internal.pageSize.width - 30, yPosition, {
      align: "right",
    });
    yPosition += 7;
  });

  // إضافة تذييل الوقف
  addWaqfFooter(doc, fontName);

  doc.save(`${filename}.pdf`);
};
