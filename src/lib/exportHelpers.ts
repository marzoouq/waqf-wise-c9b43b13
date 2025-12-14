/**
 * Export Helpers - أدوات التصدير الموحدة مع هوية الوقف
 * تدعم الخطوط العربية (Amiri) في جميع ملفات PDF
 * 
 * @version 2.9.6
 */

import { loadAmiriFonts } from "./fonts/loadArabicFonts";
import { logger } from "./logger";
import { WAQF_IDENTITY, getCurrentDateArabic, getCurrentDateTimeArabic } from "./waqf-identity";

// Dynamic imports for jsPDF
type JsPDF = any;
type AutoTable = any;

/**
 * تحميل وتهيئة الخط العربي في مستند PDF
 */
const loadArabicFontToPDF = async (doc: JsPDF): Promise<boolean> => {
  try {
    const { regular: amiriRegular, bold: amiriBold } = await loadAmiriFonts();
    
    doc.addFileToVFS("Amiri-Regular.ttf", amiriRegular);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    
    doc.addFileToVFS("Amiri-Bold.ttf", amiriBold);
    doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
    
    doc.setFont("Amiri", "normal");
    doc.setLanguage("ar");
    return true;
  } catch (error) {
    logger.error(error, { context: 'load_arabic_font_export', severity: 'low' });
    // استخدام الخط الافتراضي كخطة بديلة
    doc.setLanguage("ar");
    return false;
  }
};

/**
 * إضافة ترويسة الوقف إلى مستند PDF
 */
const addPDFHeader = (doc: JsPDF, fontName: string, title: string): number => {
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 15;
  
  // شعار واسم الوقف
  doc.setFont(fontName, "bold");
  doc.setFontSize(20);
  doc.setTextColor(22, 101, 52); // أخضر غامق
  doc.text(`${WAQF_IDENTITY.logo} ${WAQF_IDENTITY.name}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;
  
  // اسم المنصة
  doc.setFont(fontName, "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // رمادي
  doc.text(WAQF_IDENTITY.platformName, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  
  // خط فاصل
  doc.setDrawColor(22, 101, 52);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;
  
  // عنوان التقرير
  doc.setFont(fontName, "bold");
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55); // أسود
  doc.text(title, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;
  
  // التاريخ
  doc.setFont(fontName, "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`التاريخ: ${getCurrentDateArabic()}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;
  
  // إعادة الألوان للوضع الطبيعي
  doc.setTextColor(0, 0, 0);
  
  return yPosition;
};

/**
 * إضافة تذييل الوقف إلى مستند PDF
 */
const addPDFFooter = (doc: JsPDF, fontName: string) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  // خط فاصل
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
  
  // النص الرسمي
  doc.setFont(fontName, "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(`* ${WAQF_IDENTITY.footer}`, pageWidth / 2, pageHeight - 18, { align: "center" });
  
  // تاريخ الطباعة والإصدار
  doc.setFontSize(7);
  doc.text(`تاريخ الطباعة: ${getCurrentDateTimeArabic()} | الإصدار: ${WAQF_IDENTITY.version}`, pageWidth / 2, pageHeight - 12, { align: "center" });
};

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
  
  // تحميل الخط العربي
  const hasArabicFont = await loadArabicFontToPDF(doc);
  const fontName = hasArabicFont ? "Amiri" : "helvetica";

  // إضافة الترويسة
  const startY = addPDFHeader(doc, fontName, title);

  // Add table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: startY,
    styles: {
      font: fontName,
      fontSize: 10,
      halign: "right",
    },
    headStyles: {
      fillColor: [22, 101, 52], // أخضر غامق
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { bottom: 30 },
    didDrawPage: () => {
      addPDFFooter(doc, fontName);
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
  
  // تحميل الخط العربي
  const hasArabicFont = await loadArabicFontToPDF(doc);
  const fontName = hasArabicFont ? "Amiri" : "helvetica";

  // إضافة الترويسة
  let yPosition = addPDFHeader(doc, fontName, title);
  yPosition += 5;

  // Sections
  doc.setFontSize(11);
  sections.forEach((section) => {
    // Section title
    doc.setFont(fontName, "bold");
    doc.setTextColor(22, 101, 52);
    doc.text(section.title, 20, yPosition);
    yPosition += 7;

    // Section items
    doc.setFont(fontName, "normal");
    doc.setTextColor(0, 0, 0);
    section.items.forEach((item) => {
      const amountText = item.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
      doc.text(item.label, 30, yPosition);
      doc.text(amountText, doc.internal.pageSize.width - 30, yPosition, {
        align: "right",
      });
      yPosition += 6;
    });

    yPosition += 5;

    // Check if we need a new page
    if (yPosition > doc.internal.pageSize.height - 50) {
      addPDFFooter(doc, fontName);
      doc.addPage();
      yPosition = 20;
    }
  });

  // Totals
  yPosition += 5;
  doc.setDrawColor(22, 101, 52);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, doc.internal.pageSize.width - 20, yPosition);
  yPosition += 7;

  doc.setFont(fontName, "bold");
  doc.setTextColor(22, 101, 52);
  totals.forEach((total) => {
    const amountText = total.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س';
    doc.text(total.label, 20, yPosition);
    doc.text(amountText, doc.internal.pageSize.width - 30, yPosition, {
      align: "right",
    });
    yPosition += 7;
  });

  // إضافة التذييل
  addPDFFooter(doc, fontName);

  doc.save(`${filename}.pdf`);
};
