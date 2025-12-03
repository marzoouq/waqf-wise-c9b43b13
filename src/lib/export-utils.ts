/**
 * أدوات التصدير الموحدة
 * PDF, Excel, CSV
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { exportToExcel as excelExport, exportToExcelMultiSheet as excelMultiExport } from './excel-helper';

// تهيئة الخط العربي
const setupArabicFont = (doc: jsPDF) => {
  // استخدام الخط الافتراضي مع دعم RTL
  doc.setLanguage('ar');
};

interface PDFExportOptions {
  title?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  fontSize?: number;
}

/**
 * تصدير البيانات إلى PDF
 */
export function exportToPDF(
  title: string,
  headers: string[],
  rows: string[][],
  options: PDFExportOptions = {}
) {
  const {
    subtitle,
    orientation = 'landscape',
    fontSize = 10,
  } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  setupArabicFont(doc);

  // العنوان
  doc.setFontSize(16);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

  // العنوان الفرعي
  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    doc.setTextColor(0);
  }

  // التاريخ
  doc.setFontSize(8);
  doc.text(
    `تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}`,
    doc.internal.pageSize.getWidth() - 10,
    10,
    { align: 'right' }
  );

  // الجدول
  (doc as jsPDF & { autoTable: (options: unknown) => void }).autoTable({
    head: [headers],
    body: rows,
    startY: subtitle ? 30 : 25,
    styles: {
      font: 'helvetica',
      fontSize,
      cellPadding: 3,
      halign: 'right',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { top: 25 },
  });

  // حفظ الملف
  const fileName = `${title.replace(/\s+/g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

/**
 * تصدير البيانات إلى Excel
 */
export async function exportToExcel(
  data: Record<string, unknown>[],
  fileName: string,
  sheetName: string = 'البيانات'
) {
  const fullFileName = `${fileName}_${new Date().toISOString().split('T')[0]}`;
  await excelExport(data, fullFileName, sheetName);
}

/**
 * تصدير البيانات إلى Excel مع أوراق متعددة
 */
export async function exportToExcelMultiSheet(
  sheets: { name: string; data: Record<string, unknown>[] }[],
  fileName: string
) {
  const fullFileName = `${fileName}_${new Date().toISOString().split('T')[0]}`;
  await excelMultiExport(sheets, fullFileName);
}

/**
 * تصدير البيانات إلى CSV
 */
export function exportToCSV(
  headers: string[],
  rows: string[][],
  fileName: string
) {
  // إنشاء محتوى CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // إضافة BOM للدعم العربي
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // تحميل الملف
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * تصدير البيانات المالية إلى PDF مع ملخص
 */
export function exportFinancialPDF(
  title: string,
  headers: string[],
  rows: string[][],
  summary: { label: string; value: string }[],
  options: PDFExportOptions = {}
) {
  const doc = new jsPDF({
    orientation: options.orientation || 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  setupArabicFont(doc);

  // العنوان
  doc.setFontSize(18);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

  // التاريخ
  doc.setFontSize(8);
  doc.text(
    `تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}`,
    doc.internal.pageSize.getWidth() - 10,
    10,
    { align: 'right' }
  );

  // الملخص
  let yPos = 25;
  if (summary.length > 0) {
    doc.setFontSize(12);
    doc.text('الملخص:', doc.internal.pageSize.getWidth() - 10, yPos, { align: 'right' });
    yPos += 8;
    
    doc.setFontSize(10);
    summary.forEach(item => {
      doc.text(`${item.label}: ${item.value}`, doc.internal.pageSize.getWidth() - 15, yPos, { align: 'right' });
      yPos += 6;
    });
    yPos += 5;
  }

  // الجدول
  (doc as jsPDF & { autoTable: (options: unknown) => void }).autoTable({
    head: [headers],
    body: rows,
    startY: yPos,
    styles: {
      font: 'helvetica',
      fontSize: options.fontSize || 10,
      cellPadding: 3,
      halign: 'right',
    },
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244],
    },
    margin: { top: 25 },
  });

  // حفظ الملف
  const fileName = `${title.replace(/\s+/g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
