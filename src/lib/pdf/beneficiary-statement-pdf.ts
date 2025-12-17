/**
 * نظام تصدير كشف حساب المستفيد الاحترافي
 * Professional Beneficiary Statement PDF Export
 * 
 * @version 2.9.42
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { loadArabicFontToPDF, addWaqfHeader, addWaqfFooter, WAQF_COLORS, getDefaultTableStyles } from "./arabic-pdf-utils";
import { formatCurrency } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  type: string;
  method?: string;
  status: string;
  description?: string;
  payer_name?: string;
}

interface BeneficiaryInfo {
  full_name: string;
  national_id: string;
  phone?: string;
  category?: string;
  status?: string;
  beneficiary_number?: string;
}

interface StatementSummary {
  total_received: number;
  total_pending: number;
  account_balance: number;
  total_payments: number;
}

interface ExportOptions {
  beneficiary: BeneficiaryInfo;
  payments: Payment[];
  summary: StatementSummary;
  dateRange?: {
    from: string;
    to: string;
  };
}

/**
 * تصدير كشف حساب المستفيد بصيغة PDF
 */
export const exportBeneficiaryStatementPDF = async (options: ExportOptions): Promise<void> => {
  const { beneficiary, payments, summary, dateRange } = options;
  
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // تحميل الخط العربي
    const fontName = await loadArabicFontToPDF(doc);
    
    // إضافة ترويسة الوقف
    let yPosition = addWaqfHeader(doc, fontName, "كشف حساب المستفيد");
    
    const pageWidth = doc.internal.pageSize.width;
    
    // معلومات المستفيد
    yPosition = addBeneficiaryInfo(doc, fontName, beneficiary, yPosition, pageWidth);
    
    // الفترة الزمنية (إن وجدت)
    if (dateRange) {
      yPosition = addDateRange(doc, fontName, dateRange, yPosition, pageWidth);
    }
    
    // ملخص الحساب
    yPosition = addAccountSummary(doc, fontName, summary, yPosition, pageWidth);
    
    // جدول المدفوعات
    if (payments.length > 0) {
      yPosition = addPaymentsTable(doc, fontName, payments, yPosition);
    } else {
      doc.setFont(fontName, "normal");
      doc.setFontSize(12);
      doc.setTextColor(...WAQF_COLORS.muted);
      doc.text("لا توجد مدفوعات في هذه الفترة", pageWidth / 2, yPosition + 10, { align: "center" });
    }
    
    // إضافة تذييل الوقف
    addWaqfFooter(doc, fontName);
    
    // حفظ الملف
    const fileName = `كشف_حساب_${beneficiary.full_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    logger.info(`Beneficiary statement PDF exported: ${beneficiary.national_id}, payments: ${payments.length}`);
    
  } catch (error) {
    logger.error(error, { context: 'export_beneficiary_statement_pdf', severity: 'medium' });
    throw new Error('فشل في تصدير كشف الحساب');
  }
};

/**
 * إضافة معلومات المستفيد
 */
const addBeneficiaryInfo = (
  doc: jsPDF, 
  fontName: string, 
  beneficiary: BeneficiaryInfo, 
  startY: number,
  pageWidth: number
): number => {
  let yPosition = startY;
  
  // إطار معلومات المستفيد
  doc.setDrawColor(...WAQF_COLORS.primary);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(15, yPosition, pageWidth - 30, 35, 3, 3, 'FD');
  
  yPosition += 8;
  
  doc.setFont(fontName, "bold");
  doc.setFontSize(11);
  doc.setTextColor(...WAQF_COLORS.text);
  doc.text("معلومات المستفيد", pageWidth - 20, yPosition, { align: "right" });
  
  yPosition += 7;
  
  doc.setFont(fontName, "normal");
  doc.setFontSize(10);
  
  // الاسم
  doc.text(`الاسم: ${beneficiary.full_name}`, pageWidth - 20, yPosition, { align: "right" });
  
  // رقم الهوية
  doc.text(`رقم الهوية: ${beneficiary.national_id}`, pageWidth / 2, yPosition, { align: "right" });
  
  yPosition += 6;
  
  // رقم الجوال
  if (beneficiary.phone) {
    doc.text(`الجوال: ${beneficiary.phone}`, pageWidth - 20, yPosition, { align: "right" });
  }
  
  // التصنيف
  if (beneficiary.category) {
    doc.text(`التصنيف: ${beneficiary.category}`, pageWidth / 2, yPosition, { align: "right" });
  }
  
  yPosition += 6;
  
  // الحالة
  if (beneficiary.status) {
    doc.text(`الحالة: ${beneficiary.status}`, pageWidth - 20, yPosition, { align: "right" });
  }
  
  // رقم المستفيد
  if (beneficiary.beneficiary_number) {
    doc.text(`رقم المستفيد: ${beneficiary.beneficiary_number}`, pageWidth / 2, yPosition, { align: "right" });
  }
  
  return startY + 42;
};

/**
 * إضافة الفترة الزمنية
 */
const addDateRange = (
  doc: jsPDF, 
  fontName: string, 
  dateRange: { from: string; to: string }, 
  startY: number,
  pageWidth: number
): number => {
  doc.setFont(fontName, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...WAQF_COLORS.muted);
  doc.text(
    `الفترة من ${dateRange.from} إلى ${dateRange.to}`, 
    pageWidth / 2, 
    startY, 
    { align: "center" }
  );
  
  return startY + 8;
};

/**
 * إضافة ملخص الحساب
 */
const addAccountSummary = (
  doc: jsPDF, 
  fontName: string, 
  summary: StatementSummary, 
  startY: number,
  pageWidth: number
): number => {
  let yPosition = startY;
  
  doc.setFont(fontName, "bold");
  doc.setFontSize(12);
  doc.setTextColor(...WAQF_COLORS.text);
  doc.text("ملخص الحساب", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 8;
  
  // صناديق الملخص
  const boxWidth = (pageWidth - 40) / 4;
  const boxHeight = 20;
  const startX = 15;
  
  const summaryItems = [
    { label: "إجمالي المستلم", value: summary.total_received, color: WAQF_COLORS.primary },
    { label: "المبلغ المعلق", value: summary.total_pending, color: [234, 179, 8] as [number, number, number] },
    { label: "رصيد الحساب", value: summary.account_balance, color: [59, 130, 246] as [number, number, number] },
    { label: "عدد المدفوعات", value: summary.total_payments, isCount: true, color: WAQF_COLORS.muted },
  ];
  
  summaryItems.forEach((item, index) => {
    const x = startX + (index * (boxWidth + 5));
    
    // الإطار
    doc.setDrawColor(...item.color);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, yPosition, boxWidth, boxHeight, 2, 2, 'FD');
    
    // العنوان
    doc.setFont(fontName, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...WAQF_COLORS.muted);
    doc.text(item.label, x + boxWidth / 2, yPosition + 6, { align: "center" });
    
    // القيمة
    doc.setFont(fontName, "bold");
    doc.setFontSize(10);
    doc.setTextColor(...item.color);
    const valueText = item.isCount ? String(item.value) : formatCurrency(item.value);
    doc.text(valueText, x + boxWidth / 2, yPosition + 14, { align: "center" });
  });
  
  return yPosition + boxHeight + 10;
};

/**
 * إضافة جدول المدفوعات
 */
const addPaymentsTable = (
  doc: jsPDF, 
  fontName: string, 
  payments: Payment[], 
  startY: number
): number => {
  const tableStyles = getDefaultTableStyles(fontName);
  
  // تحويل البيانات للجدول
  const tableData = payments.map((payment, index) => [
    payment.status === 'completed' || payment.status === 'مكتمل' ? '✓' : '○',
    formatCurrency(payment.amount),
    payment.method || payment.type || '-',
    payment.payer_name || '-',
    new Date(payment.payment_date).toLocaleDateString('ar-SA'),
    String(index + 1),
  ]);
  
  autoTable(doc, {
    startY: startY,
    head: [['الحالة', 'المبلغ', 'طريقة الدفع', 'المصدر', 'التاريخ', '#']],
    body: tableData,
    ...tableStyles,
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'right', cellWidth: 35 },
      2: { halign: 'center', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 40 },
      4: { halign: 'center', cellWidth: 30 },
      5: { halign: 'center', cellWidth: 15 },
    },
    margin: { left: 15, right: 15 },
    didDrawPage: (data) => {
      // إضافة رقم الصفحة
      const pageCount = doc.getNumberOfPages();
      doc.setFont(fontName, "normal");
      doc.setFontSize(8);
      doc.setTextColor(...WAQF_COLORS.muted);
      doc.text(
        `صفحة ${data.pageNumber} من ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 30,
        { align: 'center' }
      );
    },
  });
  
  // @ts-ignore - autoTable adds this property
  return doc.lastAutoTable?.finalY || startY + 50;
};

/**
 * تصدير كشف حساب مبسط
 */
export const exportSimpleStatementPDF = async (
  beneficiaryName: string,
  payments: Payment[],
  totalAmount: number
): Promise<void> => {
  await exportBeneficiaryStatementPDF({
    beneficiary: {
      full_name: beneficiaryName,
      national_id: '',
    },
    payments,
    summary: {
      total_received: totalAmount,
      total_pending: 0,
      account_balance: totalAmount,
      total_payments: payments.length,
    },
  });
};
