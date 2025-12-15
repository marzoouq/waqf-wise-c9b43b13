/**
 * Excel Helper - مساعد Excel باستخدام ExcelJS مع هوية الوقف
 * بديل آمن لـ xlsx (CVE-2024-22363)
 * 
 * @version 2.9.7 - تحسين الأداء بالتحميل الديناميكي
 */

// Dynamic import for ExcelJS - لتجنب تحميل المكتبة في الصفحة الرئيسية
import { WAQF_IDENTITY, getCurrentDateArabic, getCurrentDateTimeArabic } from './waqf-identity';

// Type imports only (no runtime impact)
import type ExcelJS from 'exceljs';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelSheetData {
  name: string;
  data: Record<string, unknown>[];
  columns?: ExcelColumn[];
}

export interface ExcelExportWithIdentityConfig {
  data: Record<string, unknown>[];
  filename: string;
  sheetName?: string;
  title: string;
  subtitle?: string;
  showSummary?: boolean;
  summaryData?: { label: string; value: string | number }[];
}

// Helper to dynamically load ExcelJS
async function getExcelJS(): Promise<typeof ExcelJS> {
  const module = await import('exceljs');
  return module.default;
}

/**
 * تحميل ملف Excel في المتصفح
 */
async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * إنشاء أعمدة من البيانات تلقائياً
 */
function createColumnsFromData(data: Record<string, unknown>[]): ExcelColumn[] {
  if (!data.length) return [];
  
  return Object.keys(data[0]).map(key => {
    const maxLength = data.reduce((max, row) => {
      const value = String(row[key] || '');
      return Math.max(max, value.length, key.length);
    }, 10);
    
    return {
      header: key,
      key: key,
      width: Math.min(maxLength + 2, 50)
    };
  });
}

/**
 * إضافة ترويسة الوقف إلى ورقة Excel
 */
function addExcelHeader(
  worksheet: ExcelJS.Worksheet, 
  title: string, 
  subtitle?: string,
  columnsCount: number = 5
): number {
  let currentRow = 1;
  
  // الصف 1: شعار واسم الوقف
  worksheet.mergeCells(currentRow, 1, currentRow, columnsCount);
  const waqfNameCell = worksheet.getCell(currentRow, 1);
  waqfNameCell.value = `${WAQF_IDENTITY.logo} ${WAQF_IDENTITY.name}`;
  waqfNameCell.font = { size: 18, bold: true, color: { argb: WAQF_IDENTITY.colors.headerBg.argb } };
  waqfNameCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 30;
  currentRow++;
  
  // الصف 2: اسم المنصة
  worksheet.mergeCells(currentRow, 1, currentRow, columnsCount);
  const platformCell = worksheet.getCell(currentRow, 1);
  platformCell.value = WAQF_IDENTITY.platformName;
  platformCell.font = { size: 11, color: { argb: WAQF_IDENTITY.colors.textSecondary.argb } };
  platformCell.alignment = { horizontal: 'center', vertical: 'middle' };
  currentRow++;
  
  // الصف 3: فارغ
  currentRow++;
  
  // الصف 4: عنوان التقرير
  worksheet.mergeCells(currentRow, 1, currentRow, columnsCount);
  const titleCell = worksheet.getCell(currentRow, 1);
  titleCell.value = title;
  titleCell.font = { size: 16, bold: true, color: { argb: WAQF_IDENTITY.colors.textPrimary.argb } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 25;
  currentRow++;
  
  // الصف 5: العنوان الفرعي أو التاريخ
  worksheet.mergeCells(currentRow, 1, currentRow, columnsCount);
  const subtitleCell = worksheet.getCell(currentRow, 1);
  subtitleCell.value = subtitle || `التاريخ: ${getCurrentDateArabic()}`;
  subtitleCell.font = { size: 10, color: { argb: WAQF_IDENTITY.colors.textSecondary.argb } };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  currentRow++;
  
  // الصف 6: فارغ
  currentRow++;
  
  return currentRow;
}

/**
 * إضافة تذييل الوقف إلى ورقة Excel
 */
function addExcelFooter(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  columnsCount: number = 5
): void {
  let currentRow = startRow + 1;
  
  // صف فارغ
  currentRow++;
  
  // النص الرسمي
  worksheet.mergeCells(currentRow, 1, currentRow, columnsCount);
  const footerCell = worksheet.getCell(currentRow, 1);
  footerCell.value = `* ${WAQF_IDENTITY.footer}`;
  footerCell.font = { size: 9, italic: true, color: { argb: WAQF_IDENTITY.colors.textSecondary.argb } };
  footerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  currentRow++;
  
  // تاريخ الطباعة والإصدار
  worksheet.mergeCells(currentRow, 1, currentRow, columnsCount);
  const dateCell = worksheet.getCell(currentRow, 1);
  dateCell.value = `تاريخ التصدير: ${getCurrentDateTimeArabic()} | الإصدار: ${WAQF_IDENTITY.version}`;
  dateCell.font = { size: 8, color: { argb: 'FF9CA3AF' } };
  dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
}

/**
 * تصدير بيانات إلى Excel (صفحة واحدة) - بدون هوية
 */
export async function exportToExcel(
  data: Record<string, unknown>[],
  filename: string,
  sheetName: string = 'Sheet1'
): Promise<void> {
  const ExcelJS = await getExcelJS();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = WAQF_IDENTITY.platformName;
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ rightToLeft: true }]
  });
  
  // إنشاء الأعمدة
  const columns = createColumnsFromData(data);
  worksheet.columns = columns;
  
  // إضافة البيانات
  data.forEach(row => {
    worksheet.addRow(row);
  });
  
  // تنسيق رأس الجدول
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: WAQF_IDENTITY.colors.headerBg.argb }
  };
  headerRow.alignment = { horizontal: 'right', vertical: 'middle' };
  
  // تنسيق الصفوف
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { horizontal: 'right', vertical: 'middle' };
      if (rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: WAQF_IDENTITY.colors.alternateRow.argb }
        };
      }
    }
  });
  
  await downloadWorkbook(workbook, filename);
}

/**
 * تصدير بيانات إلى Excel مع هوية الوقف الكاملة
 */
export async function exportToExcelWithIdentity(config: ExcelExportWithIdentityConfig): Promise<void> {
  const { data, filename, sheetName = 'Sheet1', title, subtitle, showSummary, summaryData } = config;
  
  const ExcelJS = await getExcelJS();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = WAQF_IDENTITY.platformName;
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ rightToLeft: true }]
  });
  
  const columns = createColumnsFromData(data);
  const columnsCount = Math.max(columns.length, 5);
  
  // إضافة الترويسة
  let currentRow = addExcelHeader(worksheet, title, subtitle, columnsCount);
  
  // إضافة الملخص إذا وجد
  if (showSummary && summaryData && summaryData.length > 0) {
    summaryData.forEach(item => {
      worksheet.mergeCells(currentRow, 1, currentRow, 2);
      const labelCell = worksheet.getCell(currentRow, 1);
      labelCell.value = item.label;
      labelCell.font = { bold: true };
      labelCell.alignment = { horizontal: 'right' };
      
      worksheet.mergeCells(currentRow, 3, currentRow, columnsCount);
      const valueCell = worksheet.getCell(currentRow, 3);
      valueCell.value = item.value;
      valueCell.alignment = { horizontal: 'right' };
      
      currentRow++;
    });
    currentRow++;
  }
  
  // تعيين الأعمدة
  worksheet.columns = columns.map((col, index) => ({
    ...col,
    key: col.key,
    width: col.width
  }));
  
  // رؤوس الجدول
  const headerRowNum = currentRow;
  const headerRow = worksheet.getRow(headerRowNum);
  columns.forEach((col, index) => {
    headerRow.getCell(index + 1).value = col.header;
  });
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: WAQF_IDENTITY.colors.headerBg.argb }
  };
  headerRow.alignment = { horizontal: 'right', vertical: 'middle' };
  headerRow.height = 22;
  currentRow++;
  
  // إضافة البيانات
  data.forEach((rowData, rowIndex) => {
    const row = worksheet.getRow(currentRow);
    columns.forEach((col, colIndex) => {
      row.getCell(colIndex + 1).value = rowData[col.key] as string | number | boolean | null;
    });
    row.alignment = { horizontal: 'right', vertical: 'middle' };
    
    // تلوين الصفوف بالتبادل
    if (rowIndex % 2 === 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: WAQF_IDENTITY.colors.alternateRow.argb }
      };
    }
    currentRow++;
  });
  
  // إضافة التذييل
  addExcelFooter(worksheet, currentRow, columnsCount);
  
  await downloadWorkbook(workbook, filename);
}

/**
 * تصدير بيانات إلى Excel (صفحات متعددة)
 */
export async function exportToExcelMultiSheet(
  sheets: ExcelSheetData[],
  filename: string
): Promise<void> {
  const ExcelJS = await getExcelJS();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = WAQF_IDENTITY.platformName;
  workbook.created = new Date();
  
  sheets.forEach(sheet => {
    const worksheet = workbook.addWorksheet(sheet.name, {
      views: [{ rightToLeft: true }]
    });
    
    const columns = sheet.columns || createColumnsFromData(sheet.data);
    worksheet.columns = columns;
    
    sheet.data.forEach(row => {
      worksheet.addRow(row);
    });
    
    // تنسيق رأس الجدول
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: WAQF_IDENTITY.colors.headerBg.argb }
    };
    headerRow.alignment = { horizontal: 'right', vertical: 'middle' };
  });
  
  await downloadWorkbook(workbook, filename);
}

/**
 * تصدير كشف حساب مستفيد بهوية كاملة
 */
export async function exportBeneficiaryStatement(config: {
  beneficiaryName: string;
  beneficiaryId?: string;
  heirType?: string;
  distributions: { date: string; fiscalYear: string; amount: number; type: string; status?: string }[];
  totalReceived: number;
}): Promise<void> {
  const { beneficiaryName, beneficiaryId, heirType, distributions, totalReceived } = config;
  
  const ExcelJS = await getExcelJS();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = WAQF_IDENTITY.platformName;
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet('كشف الحساب', {
    views: [{ rightToLeft: true }]
  });
  
  const columnsCount = 5;
  
  // إضافة الترويسة
  let currentRow = addExcelHeader(worksheet, 'كشف حساب مستفيد', undefined, columnsCount);
  
  // معلومات المستفيد
  const beneficiaryInfo = [
    { label: 'اسم المستفيد:', value: beneficiaryName },
    ...(beneficiaryId ? [{ label: 'رقم الهوية:', value: beneficiaryId }] : []),
    ...(heirType ? [{ label: 'نوع الوريث:', value: heirType }] : []),
    { label: 'تاريخ الإصدار:', value: getCurrentDateArabic() },
  ];
  
  beneficiaryInfo.forEach(item => {
    worksheet.mergeCells(currentRow, 1, currentRow, 2);
    const labelCell = worksheet.getCell(currentRow, 1);
    labelCell.value = item.label;
    labelCell.font = { bold: true };
    labelCell.alignment = { horizontal: 'right' };
    labelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: WAQF_IDENTITY.colors.footerBg.argb }
    };
    
    worksheet.mergeCells(currentRow, 3, currentRow, columnsCount);
    const valueCell = worksheet.getCell(currentRow, 3);
    valueCell.value = item.value;
    valueCell.alignment = { horizontal: 'right' };
    valueCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: WAQF_IDENTITY.colors.footerBg.argb }
    };
    
    currentRow++;
  });
  
  currentRow++;
  
  // ملخص الحساب
  worksheet.mergeCells(currentRow, 1, currentRow, columnsCount);
  const summaryTitle = worksheet.getCell(currentRow, 1);
  summaryTitle.value = 'ملخص الحساب';
  summaryTitle.font = { size: 14, bold: true, color: { argb: WAQF_IDENTITY.colors.headerBg.argb } };
  summaryTitle.alignment = { horizontal: 'center' };
  currentRow++;
  
  const summaryInfo = [
    { label: 'إجمالي المستلم:', value: `${totalReceived.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س` },
    { label: 'عدد التوزيعات:', value: distributions.length.toString() },
  ];
  
  summaryInfo.forEach(item => {
    worksheet.mergeCells(currentRow, 1, currentRow, 2);
    const labelCell = worksheet.getCell(currentRow, 1);
    labelCell.value = item.label;
    labelCell.font = { bold: true };
    labelCell.alignment = { horizontal: 'right' };
    
    worksheet.mergeCells(currentRow, 3, currentRow, columnsCount);
    const valueCell = worksheet.getCell(currentRow, 3);
    valueCell.value = item.value;
    valueCell.alignment = { horizontal: 'right' };
    
    currentRow++;
  });
  
  currentRow++;
  
  // جدول التوزيعات
  worksheet.mergeCells(currentRow, 1, currentRow, columnsCount);
  const tableTitle = worksheet.getCell(currentRow, 1);
  tableTitle.value = 'تفاصيل التوزيعات';
  tableTitle.font = { size: 12, bold: true };
  tableTitle.alignment = { horizontal: 'center' };
  currentRow++;
  
  // رؤوس الجدول
  const headers = ['التاريخ', 'السنة المالية', 'المبلغ', 'نوع الوريث', 'الحالة'];
  const headerRow = worksheet.getRow(currentRow);
  headers.forEach((header, index) => {
    headerRow.getCell(index + 1).value = header;
  });
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: WAQF_IDENTITY.colors.headerBg.argb }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 22;
  currentRow++;
  
  // بيانات التوزيعات
  distributions.forEach((dist, index) => {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = dist.date;
    row.getCell(2).value = dist.fiscalYear;
    row.getCell(3).value = `${dist.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س`;
    row.getCell(4).value = dist.type;
    row.getCell(5).value = dist.status || 'مكتمل';
    
    row.alignment = { horizontal: 'center', vertical: 'middle' };
    
    if (index % 2 === 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: WAQF_IDENTITY.colors.alternateRow.argb }
      };
    }
    currentRow++;
  });
  
  // صف الإجمالي
  const totalRow = worksheet.getRow(currentRow);
  worksheet.mergeCells(currentRow, 1, currentRow, 2);
  totalRow.getCell(1).value = 'الإجمالي';
  totalRow.getCell(3).value = `${totalReceived.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س`;
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: WAQF_IDENTITY.colors.totalRow.argb }
  };
  totalRow.alignment = { horizontal: 'center', vertical: 'middle' };
  currentRow++;
  
  // تعديل عرض الأعمدة
  worksheet.getColumn(1).width = 15;
  worksheet.getColumn(2).width = 15;
  worksheet.getColumn(3).width = 20;
  worksheet.getColumn(4).width = 15;
  worksheet.getColumn(5).width = 12;
  
  // إضافة التذييل
  addExcelFooter(worksheet, currentRow, columnsCount);
  
  await downloadWorkbook(workbook, `كشف_حساب_${beneficiaryName}`);
}

/**
 * قراءة ملف Excel وتحويله إلى مصفوفة
 */
export async function readExcelFile(file: File): Promise<Record<string, unknown>[]> {
  const ExcelJS = await getExcelJS();
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);
  
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('لا توجد صفحات في الملف');
  }
  
  const data: Record<string, unknown>[] = [];
  const headers: string[] = [];
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // استخراج العناوين
      row.eachCell((cell) => {
        headers.push(String(cell.value || ''));
      });
    } else {
      // استخراج البيانات
      const rowData: Record<string, unknown> = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          rowData[header] = cell.value;
        }
      });
      if (Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    }
  });
  
  return data;
}

/**
 * قراءة ملف Excel من ArrayBuffer
 */
export async function readExcelBuffer(buffer: ArrayBuffer): Promise<Record<string, unknown>[]> {
  const ExcelJS = await getExcelJS();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('لا توجد صفحات في الملف');
  }
  
  const data: Record<string, unknown>[] = [];
  const headers: string[] = [];
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell) => {
        headers.push(String(cell.value || ''));
      });
    } else {
      const rowData: Record<string, unknown> = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          rowData[header] = cell.value;
        }
      });
      if (Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    }
  });
  
  return data;
}

export default {
  exportToExcel,
  exportToExcelWithIdentity,
  exportToExcelMultiSheet,
  exportBeneficiaryStatement,
  readExcelFile,
  readExcelBuffer
};
