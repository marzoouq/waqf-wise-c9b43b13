/**
 * توليد PDF للعقود
 * Contract PDF Generator
 * 
 * @version 1.0.0
 */

import type { jsPDF } from "jspdf";
import { loadArabicFontToPDF, addWaqfHeader, addWaqfFooter, processArabicText, WAQF_COLORS } from "./arabic-pdf-utils";
import { formatCurrency } from "@/lib/utils";

interface ContractData {
  id: string;
  contract_number: string;
  tenant_name: string;
  monthly_rent: number;
  start_date: string;
  end_date: string;
  status: string;
  payment_frequency?: string;
  tenant_phone?: string;
  tenant_national_id?: string;
  notes?: string;
  property?: {
    name: string;
    type: string;
    location: string;
  } | null;
}

/**
 * توليد PDF للعقد
 */
export async function generateContractPDF(contract: ContractData): Promise<jsPDF> {
  const { default: jsPDF } = await import("jspdf");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const fontName = await loadArabicFontToPDF(pdf);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // ترويسة الوقف
  let yPosition = addWaqfHeader(pdf, fontName, "عقد إيجار");
  yPosition += 5;

  // رقم العقد
  pdf.setFont(fontName, "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(...WAQF_COLORS.primary);
  pdf.text(processArabicText(`رقم العقد: ${contract.contract_number}`), pageWidth - margin, yPosition, { align: "right" });
  yPosition += 12;

  // معلومات العقد
  const contractInfo = [
    { label: "اسم المستأجر", value: contract.tenant_name },
    { label: "رقم الهوية", value: contract.tenant_national_id || "-" },
    { label: "رقم الجوال", value: contract.tenant_phone || "-" },
    { label: "العقار", value: contract.property?.name || "-" },
    { label: "نوع العقار", value: contract.property?.type || "-" },
    { label: "الموقع", value: contract.property?.location || "-" },
    { label: "الإيجار الشهري", value: formatCurrency(contract.monthly_rent) },
    { label: "دورية الدفع", value: contract.payment_frequency || "شهري" },
    { label: "تاريخ البداية", value: contract.start_date },
    { label: "تاريخ النهاية", value: contract.end_date },
    { label: "الحالة", value: contract.status },
  ];

  pdf.setFontSize(11);
  for (const info of contractInfo) {
    pdf.setFont(fontName, "bold");
    pdf.setTextColor(...WAQF_COLORS.text);
    pdf.text(processArabicText(`${info.label}:`), pageWidth - margin, yPosition, { align: "right" });
    
    pdf.setFont(fontName, "normal");
    pdf.setTextColor(...WAQF_COLORS.muted);
    pdf.text(processArabicText(info.value), pageWidth - margin - 50, yPosition, { align: "right" });
    
    yPosition += 8;
  }

  // الملاحظات
  if (contract.notes) {
    yPosition += 5;
    pdf.setFont(fontName, "bold");
    pdf.setTextColor(...WAQF_COLORS.text);
    pdf.text(processArabicText("ملاحظات:"), pageWidth - margin, yPosition, { align: "right" });
    yPosition += 6;
    
    pdf.setFont(fontName, "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(...WAQF_COLORS.muted);
    const noteLines = pdf.splitTextToSize(processArabicText(contract.notes), pageWidth - margin * 2);
    for (const line of noteLines) {
      pdf.text(line, pageWidth - margin, yPosition, { align: "right" });
      yPosition += 5;
    }
  }

  // خط فاصل
  yPosition += 10;
  pdf.setDrawColor(...WAQF_COLORS.primary);
  pdf.setLineWidth(0.3);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // مساحة التوقيع
  pdf.setFont(fontName, "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...WAQF_COLORS.text);
  
  // توقيع المؤجر
  pdf.text(processArabicText("توقيع المؤجر:"), pageWidth - margin, yPosition, { align: "right" });
  pdf.line(pageWidth - margin - 80, yPosition + 3, pageWidth - margin - 30, yPosition + 3);
  
  // توقيع المستأجر
  pdf.text(processArabicText("توقيع المستأجر:"), margin + 80, yPosition, { align: "right" });
  pdf.line(margin, yPosition + 3, margin + 50, yPosition + 3);

  // التذييل
  addWaqfFooter(pdf, fontName);

  return pdf;
}
