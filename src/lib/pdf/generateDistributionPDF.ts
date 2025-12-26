/**
 * توليد PDF للتوزيعات
 * Distribution PDF Generator
 * 
 * @version 1.0.0
 */

import type { jsPDF } from "jspdf";
import { loadArabicFontToPDF, addWaqfHeader, addWaqfFooter, processArabicText, WAQF_COLORS } from "./arabic-pdf-utils";
import { formatCurrency } from "@/lib/utils";

interface DistributionData {
  id: string;
  name: string;
  distribution_date: string;
  total_amount: number;
  beneficiaries_count: number;
  status: string;
  fiscal_year_id?: string;
  distribution_type?: string;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
}

interface VoucherData {
  beneficiary_name: string;
  amount: number;
  status: string;
}

/**
 * توليد PDF للتوزيع
 */
export async function generateDistributionPDF(
  distribution: DistributionData,
  vouchers?: VoucherData[]
): Promise<jsPDF> {
  const { default: jsPDF } = await import("jspdf");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const fontName = await loadArabicFontToPDF(pdf);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;

  // ترويسة الوقف
  let yPosition = addWaqfHeader(pdf, fontName, "تقرير التوزيع");
  yPosition += 5;

  // اسم التوزيع
  pdf.setFont(fontName, "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(...WAQF_COLORS.primary);
  pdf.text(processArabicText(distribution.name), pageWidth / 2, yPosition, { align: "center" });
  yPosition += 12;

  // معلومات التوزيع
  const distributionInfo = [
    { label: "تاريخ التوزيع", value: distribution.distribution_date },
    { label: "نوع التوزيع", value: distribution.distribution_type || "عام" },
    { label: "إجمالي المبلغ", value: formatCurrency(distribution.total_amount) },
    { label: "عدد المستفيدين", value: String(distribution.beneficiaries_count) },
    { label: "الحالة", value: getStatusLabel(distribution.status) },
  ];

  if (distribution.approved_by) {
    distributionInfo.push({ label: "الموافقة من", value: distribution.approved_by });
  }
  if (distribution.approved_at) {
    distributionInfo.push({ label: "تاريخ الموافقة", value: distribution.approved_at.split("T")[0] });
  }

  pdf.setFontSize(11);
  for (const info of distributionInfo) {
    pdf.setFont(fontName, "bold");
    pdf.setTextColor(...WAQF_COLORS.text);
    pdf.text(processArabicText(`${info.label}:`), pageWidth - margin, yPosition, { align: "right" });
    
    pdf.setFont(fontName, "normal");
    pdf.setTextColor(...WAQF_COLORS.muted);
    pdf.text(processArabicText(info.value), pageWidth - margin - 50, yPosition, { align: "right" });
    
    yPosition += 8;
  }

  // الملاحظات
  if (distribution.notes) {
    yPosition += 5;
    pdf.setFont(fontName, "bold");
    pdf.setTextColor(...WAQF_COLORS.text);
    pdf.text(processArabicText("ملاحظات:"), pageWidth - margin, yPosition, { align: "right" });
    yPosition += 6;
    
    pdf.setFont(fontName, "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(...WAQF_COLORS.muted);
    const noteLines = pdf.splitTextToSize(processArabicText(distribution.notes), pageWidth - margin * 2);
    for (const line of noteLines) {
      pdf.text(line, pageWidth - margin, yPosition, { align: "right" });
      yPosition += 5;
    }
  }

  // جدول المستفيدين
  if (vouchers && vouchers.length > 0) {
    yPosition += 10;
    pdf.setDrawColor(...WAQF_COLORS.primary);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    pdf.setFont(fontName, "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...WAQF_COLORS.primary);
    pdf.text(processArabicText("تفاصيل التوزيع"), pageWidth - margin, yPosition, { align: "right" });
    yPosition += 8;

    // رأس الجدول
    pdf.setFillColor(...WAQF_COLORS.primary);
    pdf.rect(margin, yPosition, pageWidth - margin * 2, 8, "F");
    
    pdf.setFont(fontName, "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...WAQF_COLORS.white);
    pdf.text(processArabicText("م"), pageWidth - margin - 5, yPosition + 5.5, { align: "right" });
    pdf.text(processArabicText("اسم المستفيد"), pageWidth - margin - 20, yPosition + 5.5, { align: "right" });
    pdf.text(processArabicText("المبلغ"), margin + 60, yPosition + 5.5, { align: "right" });
    pdf.text(processArabicText("الحالة"), margin + 20, yPosition + 5.5, { align: "right" });
    yPosition += 8;

    // صفوف الجدول
    pdf.setFont(fontName, "normal");
    pdf.setTextColor(...WAQF_COLORS.text);
    
    for (let i = 0; i < vouchers.length; i++) {
      const voucher = vouchers[i];
      
      // لون الصف المتناوب
      if (i % 2 === 1) {
        pdf.setFillColor(...WAQF_COLORS.alternateRow);
        pdf.rect(margin, yPosition, pageWidth - margin * 2, 7, "F");
      }
      
      pdf.text(processArabicText(String(i + 1)), pageWidth - margin - 5, yPosition + 5, { align: "right" });
      pdf.text(processArabicText(voucher.beneficiary_name), pageWidth - margin - 20, yPosition + 5, { align: "right" });
      pdf.text(processArabicText(formatCurrency(voucher.amount)), margin + 60, yPosition + 5, { align: "right" });
      pdf.text(processArabicText(getStatusLabel(voucher.status)), margin + 20, yPosition + 5, { align: "right" });
      
      yPosition += 7;
      
      // التحقق من نهاية الصفحة
      if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
        addWaqfFooter(pdf, fontName);
        pdf.addPage();
        yPosition = 20;
      }
    }
  }

  // التذييل
  addWaqfFooter(pdf, fontName);

  return pdf;
}

function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    draft: "مسودة",
    pending: "قيد الانتظار",
    approved: "معتمد",
    paid: "مدفوع",
    cancelled: "ملغي",
  };
  return statusMap[status] || status;
}
