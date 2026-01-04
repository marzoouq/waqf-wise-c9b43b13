/**
 * أدوات PDF العربية الموحدة
 * Unified Arabic PDF Utilities
 * 
 * @version 5.0.0 - Arabic Shaping Only
 * 
 * الحل النهائي المثبت:
 * - استخدام Arabic Shaping فقط (js-arabic-reshaper) لتوصيل الحروف
 * - خط Amiri OpenType + jsPDF يتولى الترتيب RTL تلقائياً
 * - لا حاجة لـ BiDi reordering اليدوي
 * 
 * ⚠️ ملف governance-pdf.ts يعمل لأنه لا يستخدم أي معالجة - فقط الخط ⚠️
 * ⚠️ الحل: reshape فقط لتوصيل الحروف، بدون أي عكس ⚠️
 */

import { loadAmiriFonts } from "@/lib/fonts/loadArabicFonts";
import { logger } from "@/lib/logger";
import { WAQF_IDENTITY, getCurrentDateArabic, getCurrentDateTimeArabic } from "@/lib/waqf-identity";
import type { jsPDF } from "jspdf";

// Arabic reshaper for proper letter joining
import { reshape } from "js-arabic-reshaper";

// ============= أدوات مساعدة =============

/**
 * نمط الأحرف العربية (يشمل جميع نطاقات Unicode العربية)
 */
const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * فحص إذا كان النص يحتوي على عربي
 */
function containsArabic(text: string): boolean {
  return ARABIC_CHAR_REGEX.test(text);
}

// ============= معالجة النص العربي =============

/**
 * معالجة النص العربي للعرض الصحيح في PDF
 * 
 * الحل النهائي المثبت:
 * - استخدام Arabic Shaping فقط (reshape) لتوصيل الحروف
 * - خط Amiri + jsPDF يتولى الترتيب RTL تلقائياً
 * - لا حاجة لـ BiDi reordering اليدوي
 * 
 * ⚠️ ملاحظة مهمة: ملف governance-pdf.ts يعمل بشكل صحيح لأنه:
 *    1. يستخدم خط Amiri (يدعم OpenType)
 *    2. يمرر النص مباشرة بدون أي معالجة
 *    3. jsPDF يتولى الترتيب RTL تلقائياً
 * 
 * لذا الحل هو: reshape فقط لتوصيل الحروف، بدون أي عكس أو BiDi
 * 
 * @version 5.0.0 - حل نهائي: Arabic Shaping فقط
 */
export const processArabicText = (text: string | number | null | undefined): string => {
  if (text === null || text === undefined) return "";

  const strText = String(text);
  if (!strText.trim()) return "";

  try {
    // إذا لا يوجد عربي، إرجاع كما هو (مهم للأرقام/الأكواد)
    if (!containsArabic(strText)) return strText;

    // تشكيل الحروف العربية فقط (بدون أي عكس)
    // تجنّب doc.setR2L(true) لأنه يعكس ترتيب الأحرف/الأرقام ويؤدي لنص معكوس
    return reshape(strText);
  } catch (error) {
    logger.error(error, { context: "process_arabic_text", severity: "low" });
    return strText;
  }
};

// ============= تنسيق الأرقام والعملة =============

/**
 * تنسيق الأرقام للـ PDF
 * يستخدم تنسيق إنجليزي (1,234,567.89) لضمان التوافق
 */
export const formatNumberForPDF = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * تنسيق العملة للـ PDF
 * الترتيب: الرقم أولاً ثم "ر.س"
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

// ============= معالجة الجداول =============

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

// ============= تحميل الخط العربي =============

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

    // مهم: لا نفعّل setR2L(true) لأنه يعكس ترتيب الأحرف/الأرقام
    // نعتمد على processArabicText(reshape) + محاذاة يمين/توسيط عبر align
    if (typeof (doc as any).setR2L === "function") {
      (doc as any).setR2L(false);
    }

    return "Amiri";
  } catch (error) {
    logger.error(error, { context: "load_arabic_font_pdf", severity: "low" });
    doc.setLanguage("ar");
    return "helvetica";
  }
};

// ============= ترويسة وتذييل الوقف =============

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

// ============= ختم الناظر الإلكتروني =============

export interface NazerStampOptions {
  nazerName?: string;
  date?: string;
  stampImageUrl?: string | null;
  signatureImageUrl?: string | null;
}

/**
 * إضافة ختم الناظر الإلكتروني للاعتماد
 * يدعم صور مخصصة للختم والتوقيع
 */
export const addNazerStamp = async (
  doc: jsPDF, 
  fontName: string,
  options: NazerStampOptions = {}
): Promise<void> => {
  const { 
    nazerName = "ناظر الوقف", 
    date, 
    stampImageUrl, 
    signatureImageUrl 
  } = options;
  
  const pageWidth = doc.internal.pageSize.width;
  const stampX = pageWidth - 40;
  const stampY = 255;
  
  // إذا توجد صورة ختم مخصصة
  if (stampImageUrl) {
    try {
      const img = await loadImageAsBase64(stampImageUrl);
      doc.addImage(img, 'PNG', stampX - 20, stampY - 20, 40, 40);
    } catch {
      // fallback للختم المرسوم
      drawDefaultStamp(doc, fontName, stampX, stampY, nazerName, date);
    }
  } else {
    // الختم المرسوم الافتراضي
    drawDefaultStamp(doc, fontName, stampX, stampY, nazerName, date);
  }
  
  // إضافة التوقيع إذا وُجد
  if (signatureImageUrl) {
    try {
      const sig = await loadImageAsBase64(signatureImageUrl);
      doc.addImage(sig, 'PNG', stampX - 55, stampY - 10, 30, 20);
    } catch {
      // تجاهل خطأ تحميل التوقيع
    }
  }
  
  // إعادة الألوان للوضع الطبيعي
  doc.setTextColor(0, 0, 0);
};

/**
 * رسم الختم الافتراضي (في حالة عدم وجود صورة)
 */
function drawDefaultStamp(
  doc: jsPDF, 
  fontName: string, 
  stampX: number, 
  stampY: number, 
  nazerName: string, 
  date?: string
): void {
  const stampRadius = 18;
  
  // رسم الختم الدائري
  doc.setDrawColor(22, 101, 52);
  doc.setFillColor(240, 253, 244);
  doc.setLineWidth(1.5);
  doc.circle(stampX, stampY, stampRadius, 'FD');
  
  // دائرة داخلية
  doc.setLineWidth(0.5);
  doc.circle(stampX, stampY, stampRadius - 3, 'S');
  
  // نص "معتمد"
  doc.setFont(fontName, "bold");
  doc.setFontSize(11);
  doc.setTextColor(22, 101, 52);
  doc.text(processArabicText("معتمد"), stampX, stampY - 4, { align: "center" });
  
  // اسم الناظر
  doc.setFontSize(7);
  doc.setFont(fontName, "normal");
  doc.text(processArabicText(nazerName), stampX, stampY + 3, { align: "center" });
  
  // التاريخ
  const stampDate = date || new Date().toLocaleDateString('en-GB');
  doc.setFontSize(6);
  doc.text(stampDate, stampX, stampY + 8, { align: "center" });
}

/**
 * تحميل صورة كـ Base64 لإضافتها للـ PDF
 */
async function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ============= الألوان الرسمية =============

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
