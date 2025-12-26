/**
 * أدوات PDF العربية الموحدة
 * Unified Arabic PDF Utilities with Waqf Identity
 * 
 * @version 2.9.74
 */

import { loadAmiriFonts } from "@/lib/fonts/loadArabicFonts";
import { logger } from "@/lib/logger";
import { WAQF_IDENTITY, getCurrentDateArabic, getCurrentDateTimeArabic } from "@/lib/waqf-identity";
import type { jsPDF } from "jspdf";

// Import Arabic reshaper for proper text rendering
import { reshape } from "js-arabic-reshaper";

/**
 * معالجة النص العربي للعرض الصحيح في PDF
 * - إعادة تشكيل الحروف (reshape) لتصبح متصلة
 * - معالجة النص المختلط (عربي + أرقام/رموز/إنجليزي) بدون قلب الأرقام
 */
export const processArabicText = (text: string | number | null | undefined): string => {
  if (text === null || text === undefined) return "";

  const strText = String(text);
  if (!strText) return "";

  try {
    return processRTLMixedText(strText);
  } catch (error) {
    logger.error(error, { context: "process_arabic_text", severity: "low" });
    return strText;
  }
};

/**
 * معالجة RTL للنص المختلط بشكل آمن:
 * - يعيد تشكيل العربية لتصبح الحروف متصلة
 * - يعكس النص كاملاً لتجاوز غياب الـ bidi في jsPDF
 * - ثم يُصلح قلب الأرقام/اللاتيني داخل النص حتى لا تنعكس (1,083,094)
 */
function processRTLMixedText(text: string): string {
  const reverse = (s: string) => s.split("").reverse().join("");

  // إعادة تشكيل العربية (لا تؤثر سلباً على الأرقام)
  const reshaped = reshape(text);

  // عكس كامل النص لمحاكاة RTL
  let rtl = reverse(reshaped);

  // إصلاح "ر.س" المقلوبة أولاً
  rtl = rtl.replace(/س\.ر/g, "ر.س");
  
  // إصلاح الأرقام مع العملة - نمط شامل يلتقط:
  // - الأرقام مع الفواصل والنقاط (1,083,094.50)
  // - النسب المئوية (84.8%)
  // - التواريخ (2024/01/15)
  // - العملة (ر.س)
  
  // Pattern 1: أرقام مع فواصل ونقاط (مثل 1,083,094 أو 58.932,521)
  rtl = rtl.replace(
    /[0-9\u0660-\u0669]+(?:[,\.][0-9\u0660-\u0669]+)*/g,
    (m) => reverse(m)
  );
  
  // Pattern 2: نسب مئوية
  rtl = rtl.replace(
    /%[0-9\u0660-\u0669]+(?:\.[0-9\u0660-\u0669]+)?/g,
    (m) => reverse(m)
  );
  
  // Pattern 3: تواريخ
  rtl = rtl.replace(
    /[0-9\u0660-\u0669]+[\/\-][0-9\u0660-\u0669]+(?:[\/\-][0-9\u0660-\u0669]+)?/g,
    (m) => reverse(m)
  );

  // إصلاح الكلمات/الاختصارات اللاتينية إن وجدت
  rtl = rtl.replace(/[A-Za-z][A-Za-z0-9._-]*/g, (m) => reverse(m));

  return rtl;
}

/**
 * معالجة مصفوفة من الرؤوس للجداول
 */
export const processArabicHeaders = (headers: string[]): string[] => {
  return headers.map(header => processArabicText(header));
};

/**
 * معالجة مصفوفة من البيانات للجداول
 */
export const processArabicTableData = (
  data: (string | number | boolean | null | undefined)[][]
): string[][] => {
  return data.map(row => 
    row.map(cell => {
      if (typeof cell === 'boolean') return cell ? 'نعم' : 'لا';
      return processArabicText(cell);
    })
  );
};

/**
 * تحميل وتهيئة الخط العربي في مستند PDF
 */
export const loadArabicFontToPDF = async (doc: jsPDF): Promise<string> => {
  try {
    const { regular: amiriRegular, bold: amiriBold } = await loadAmiriFonts();
    
    doc.addFileToVFS("Amiri-Regular.ttf", amiriRegular);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    
    doc.addFileToVFS("Amiri-Bold.ttf", amiriBold);
    doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
    
    doc.setFont("Amiri", "normal");
    doc.setLanguage("ar");
    doc.setR2L(true);
    
    return "Amiri";
  } catch (error) {
    logger.error(error, { context: 'load_arabic_font_pdf', severity: 'low' });
    // Fallback to helvetica
    doc.setLanguage("ar");
    doc.setR2L(true);
    return "helvetica";
  }
};

/**
 * إضافة ترويسة الوقف إلى مستند PDF
 */
export const addWaqfHeader = (doc: jsPDF, fontName: string, title: string): number => {
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 15;
  
  // شعار واسم الوقف
  doc.setFont(fontName, "bold");
  doc.setFontSize(18);
  doc.setTextColor(22, 101, 52); // أخضر غامق
  doc.text(processArabicText(`${WAQF_IDENTITY.logo} ${WAQF_IDENTITY.name}`), pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;
  
  // اسم المنصة
  doc.setFont(fontName, "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // رمادي
  doc.text(processArabicText(WAQF_IDENTITY.platformName), pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  
  // خط فاصل
  doc.setDrawColor(22, 101, 52);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;
  
  // عنوان التقرير
  doc.setFont(fontName, "bold");
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text(processArabicText(title), pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;
  
  // التاريخ
  doc.setFont(fontName, "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(processArabicText(`التاريخ: ${getCurrentDateArabic()}`), pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;
  
  // إعادة الألوان للوضع الطبيعي
  doc.setTextColor(0, 0, 0);
  
  return yPosition;
};

/**
 * إضافة تذييل الوقف إلى مستند PDF
 */
export const addWaqfFooter = (doc: jsPDF, fontName: string) => {
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
  doc.text(processArabicText(`* ${WAQF_IDENTITY.footer}`), pageWidth / 2, pageHeight - 18, { align: "center" });
  
  // تاريخ الطباعة والإصدار
  doc.setFontSize(7);
  doc.text(processArabicText(`تاريخ الطباعة: ${getCurrentDateTimeArabic()} | الإصدار: ${WAQF_IDENTITY.version}`), pageWidth / 2, pageHeight - 12, { align: "center" });
};

/**
 * الألوان الرسمية للوقف
 */
export const WAQF_COLORS = {
  primary: [22, 101, 52] as [number, number, number],      // أخضر غامق
  secondary: [34, 139, 34] as [number, number, number],    // أخضر فاتح
  header: [71, 85, 105] as [number, number, number],       // رمادي أزرق
  text: [31, 41, 55] as [number, number, number],          // أسود
  muted: [107, 114, 128] as [number, number, number],      // رمادي
  white: [255, 255, 255] as [number, number, number],      // أبيض
  alternateRow: [249, 250, 251] as [number, number, number], // رمادي فاتح
};

/**
 * إعدادات الجدول الافتراضية مع دعم العربية
 */
export const getDefaultTableStyles = (fontName: string) => ({
  styles: {
    font: fontName,
    fontSize: 10,
    halign: "right" as const,
  },
  headStyles: {
    fillColor: WAQF_COLORS.primary,
    textColor: WAQF_COLORS.white,
    fontStyle: "bold" as const,
  },
  alternateRowStyles: {
    fillColor: WAQF_COLORS.alternateRow,
  },
});
