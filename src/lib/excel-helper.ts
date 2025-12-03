/**
 * Excel Helper - مساعد Excel باستخدام ExcelJS
 * بديل آمن لـ xlsx (CVE-2024-22363)
 * 
 * @version 2.6.9
 */

import ExcelJS from 'exceljs';

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
 * تصدير بيانات إلى Excel (صفحة واحدة)
 */
export async function exportToExcel(
  data: Record<string, unknown>[],
  filename: string,
  sheetName: string = 'Sheet1'
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'منصة إدارة الوقف';
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
    fgColor: { argb: 'FF3B82F6' }
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
          fgColor: { argb: 'FFF5F7FA' }
        };
      }
    }
  });
  
  await downloadWorkbook(workbook, filename);
}

/**
 * تصدير بيانات إلى Excel (صفحات متعددة)
 */
export async function exportToExcelMultiSheet(
  sheets: ExcelSheetData[],
  filename: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'منصة إدارة الوقف';
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
      fgColor: { argb: 'FF22C55E' }
    };
    headerRow.alignment = { horizontal: 'right', vertical: 'middle' };
  });
  
  await downloadWorkbook(workbook, filename);
}

/**
 * قراءة ملف Excel وتحويله إلى مصفوفة
 */
export async function readExcelFile(file: File): Promise<Record<string, unknown>[]> {
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
  exportToExcelMultiSheet,
  readExcelFile,
  readExcelBuffer
};
