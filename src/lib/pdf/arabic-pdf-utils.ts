/**
 * أدوات PDF العربية الموحدة
 * Unified Arabic PDF Utilities with Waqf Identity
 * 
 * @version 2.9.75 - إصلاح جذري لمعالجة الأرقام
 */

import { loadAmiriFonts } from "@/lib/fonts/loadArabicFonts";
import { logger } from "@/lib/logger";
import { WAQF_IDENTITY, getCurrentDateArabic, getCurrentDateTimeArabic } from "@/lib/waqf-identity";
import type { jsPDF } from "jspdf";

// Import Arabic reshaper for proper text rendering
import { reshape } from "js-arabic-reshaper";

/**
 * تنسيق الأرقام للـ PDF
 * يستخدم تنسيق إنجليزي (1,234,567.89) لضمان التوافق مع معالجة RTL
 */
export const formatNumberForPDF = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * تنسيق العملة للـ PDF
 */
export const formatCurrencyForPDF = (num: number): string => {
  return `${formatNumberForPDF(num)} ر.س`;
};

/**
 * تنسيق النسبة المئوية للـ PDF
 */
export const formatPercentageForPDF = (num: number): string => {
  return `${num}%`;
};

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
 * معالجة RTL للنص المختلط بنهج Token-based:
 * - يقسم النص إلى مقاطع (عربي / أرقام+رموز / لاتيني)
 * - يعالج كل مقطع بشكل منفصل
 * - يعيد ترتيب المقاطع لمحاكاة RTL بدون قلب الأرقام
 * 
 * @version 3.0.0 - Token-based approach
 */
function processRTLMixedText(text: string): string {
  // تقسيم النص إلى مقاطع (tokens)
  // المقاطع: عربي، أرقام مع فواصل/نقاط، لاتيني، مسافات/رموز
  const tokenRegex = /([\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+)|([0-9٠-٩]+(?:[,\.،٬٫][0-9٠-٩]+)*%?)|([A-Za-z]+(?:[._-][A-Za-z0-9]+)*)|(\s+)|([^\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF0-9٠-٩A-Za-z\s]+)/g;
  
  const tokens: { type: 'arabic' | 'number' | 'latin' | 'space' | 'symbol'; value: string }[] = [];
  let match;
  
  while ((match = tokenRegex.exec(text)) !== null) {
    if (match[1]) {
      // نص عربي - نعيد تشكيله
      tokens.push({ type: 'arabic', value: reshape(match[1]) });
    } else if (match[2]) {
      // أرقام - نحافظ عليها كما هي
      tokens.push({ type: 'number', value: match[2] });
    } else if (match[3]) {
      // نص لاتيني - نحافظ عليه كما هو
      tokens.push({ type: 'latin', value: match[3] });
    } else if (match[4]) {
      // مسافات
      tokens.push({ type: 'space', value: match[4] });
    } else if (match[5]) {
      // رموز (ر.س، %، إلخ)
      tokens.push({ type: 'symbol', value: match[5] });
    }
  }
  
  // عكس ترتيب المقاطع لمحاكاة RTL
  const reversedTokens = tokens.reverse();
  
  // بناء النص النهائي
  let result = '';
  for (const token of reversedTokens) {
    if (token.type === 'arabic') {
      // النص العربي المُشكَّل يُعكس حروفه
      result += token.value.split('').reverse().join('');
    } else if (token.type === 'number' || token.type === 'latin') {
      // الأرقام واللاتيني تبقى كما هي (لا نعكسها)
      result += token.value;
    } else if (token.type === 'symbol') {
      // معالجة الرموز الخاصة
      let symbol = token.value;
      // إصلاح ر.س
      symbol = symbol.replace(/س\.ر/g, 'ر.س');
      // عكس الرموز العربية
      result += symbol.split('').reverse().join('');
    } else {
      result += token.value;
    }
  }
  
  return result;
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
