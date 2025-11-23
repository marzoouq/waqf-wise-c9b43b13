import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatZATCACurrency } from "./zatca";
import type { OrganizationSettings } from "@/hooks/useOrganizationSettings";
import { loadAmiriFonts } from "./fonts/loadArabicFonts";
import { logger } from "./logger";

interface Receipt {
  id: string;
  payment_number: string;
  payment_date: string;
  amount: number;
  payer_name: string;
  payment_method?: string;
  description: string;
  reference_number?: string;
  notes?: string;
}

export const generateReceiptPDF = async (
  receipt: Receipt,
  orgSettings: OrganizationSettings | null
): Promise<jsPDF> => {
  try {
    // تحميل الخطوط العربية
    const { regular: amiriRegular, bold: amiriBold } = await loadAmiriFonts();
    
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // تسجيل الخطوط العربية
    doc.addFileToVFS("Amiri-Regular.ttf", amiriRegular);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.addFileToVFS("Amiri-Bold.ttf", amiriBold);
    doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
    doc.setFont("Amiri", "normal");

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let yPos = margin;

    // ألوان
    const primaryColor: [number, number, number] = [76, 175, 80]; // أخضر
    const secondaryColor: [number, number, number] = [52, 73, 94];

    // خلفية الهيدر
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 50, "F");
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(0, 48, pageWidth, 48);

    // عنوان سند القبض
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("Amiri", "bold");
    doc.text("سند قبض", pageWidth / 2, 22, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("Amiri", "normal");
    doc.text("Payment Receipt", pageWidth / 2, 32, { align: "center" });

    // رقم السند والتاريخ
    doc.setFontSize(10);
    doc.text(`رقم السند: ${receipt.payment_number}`, pageWidth - margin, 42, {
      align: "right",
    });

    yPos = 60;

    // معلومات المنظمة
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("Amiri", "bold");
    doc.setFontSize(12);
    doc.text("معلومات المنظمة", margin, yPos);
    
    doc.setFont("Amiri", "normal");
    doc.setFontSize(10);
    
    if (orgSettings) {
      yPos += 8;
      doc.text(orgSettings.organization_name_ar, margin, yPos);
      yPos += 6;
      doc.text(`الرقم الضريبي: ${orgSettings.vat_registration_number}`, margin, yPos);
      yPos += 6;
      doc.text(`السجل التجاري: ${orgSettings.commercial_registration_number}`, margin, yPos);
      yPos += 6;
      doc.text(`العنوان: ${orgSettings.address_ar}`, margin, yPos);
      if (orgSettings.phone) {
        yPos += 6;
        doc.text(`الهاتف: ${orgSettings.phone}`, margin, yPos);
      }
    }

    yPos += 15;

    // صندوق تفاصيل السند
    const boxHeight = 85;
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.7);
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPos, pageWidth - 2 * margin, boxHeight, "FD");

    // عنوان التفاصيل
    doc.setFont("Amiri", "bold");
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("تفاصيل السند", margin + 5, yPos + 10);

    doc.setFont("Amiri", "normal");
    doc.setFontSize(11);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

    let detailY = yPos + 20;
    const labelX = margin + 5;
    const valueX = pageWidth - margin - 5;

    // التاريخ
    doc.setFont("Amiri", "bold");
    doc.text("التاريخ:", labelX, detailY);
    doc.setFont("Amiri", "normal");
    doc.text(
      new Date(receipt.payment_date).toLocaleDateString("ar-SA"),
      valueX,
      detailY,
      { align: "right" }
    );

    detailY += 10;

    // اسم الدافع
    doc.setFont("Amiri", "bold");
    doc.text("استلمنا من:", labelX, detailY);
    doc.setFont("Amiri", "normal");
    doc.text(receipt.payer_name, valueX, detailY, { align: "right" });

    detailY += 10;

    // المبلغ بالأرقام
    doc.setFont("Amiri", "bold");
    doc.text("المبلغ:", labelX, detailY);
    doc.setFont("Amiri", "normal");
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(
      `${formatZATCACurrency(receipt.amount)} ريال سعودي`,
      valueX,
      detailY,
      { align: "right" }
    );

    detailY += 12;

    // طريقة الدفع
    doc.setFont("Amiri", "bold");
    doc.setFontSize(11);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("طريقة الدفع:", labelX, detailY);
    doc.setFont("Amiri", "normal");
    doc.text(receipt.payment_method || 'نقدي', valueX, detailY, { align: "right" });

    detailY += 10;

    // البيان
    doc.setFont("Amiri", "bold");
    doc.text("البيان:", labelX, detailY);
    doc.setFont("Amiri", "normal");
    const descLines = doc.splitTextToSize(receipt.description, pageWidth - 2 * margin - 30);
    doc.text(descLines, labelX + 20, detailY);

    yPos += boxHeight + 15;

    // رقم المرجع إذا وجد
    if (receipt.reference_number) {
      doc.setFont("Amiri", "bold");
      doc.setFontSize(10);
      doc.text(`رقم المرجع: ${receipt.reference_number}`, margin, yPos);
      yPos += 10;
    }

    // الملاحظات
    if (receipt.notes) {
      doc.setFont("Amiri", "bold");
      doc.setFontSize(11);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text("ملاحظات:", margin, yPos);
      
      doc.setFont("Amiri", "normal");
      doc.setFontSize(10);
      yPos += 7;
      const noteLines = doc.splitTextToSize(receipt.notes, pageWidth - 2 * margin - 10);
      doc.text(noteLines, margin + 5, yPos);
      yPos += noteLines.length * 5 + 10;
    }

    // التوقيعات
    yPos = pageHeight - 70;
    const sigWidth = 70;
    const sigGap = 20;

    // المستلم
    const receiverX = margin;
    doc.setFont("Amiri", "bold");
    doc.setFontSize(10);
    doc.text("المستلم", receiverX + sigWidth / 2, yPos, { align: "center" });
    yPos += 3;
    doc.setLineWidth(0.3);
    doc.setDrawColor(100, 100, 100);
    doc.line(receiverX, yPos, receiverX + sigWidth, yPos);
    yPos += 5;
    doc.setFont("Amiri", "normal");
    doc.setFontSize(8);
    doc.text("التوقيع", receiverX + sigWidth / 2, yPos, { align: "center" });

    // المسؤول المالي
    yPos = pageHeight - 70;
    const financeX = pageWidth / 2 - sigWidth / 2;
    doc.setFont("Amiri", "bold");
    doc.setFontSize(10);
    doc.text("المسؤول المالي", financeX + sigWidth / 2, yPos, { align: "center" });
    yPos += 3;
    doc.line(financeX, yPos, financeX + sigWidth, yPos);
    yPos += 5;
    doc.setFont("Amiri", "normal");
    doc.setFontSize(8);
    doc.text("التوقيع", financeX + sigWidth / 2, yPos, { align: "center" });

    // المعتمد
    yPos = pageHeight - 70;
    const approverX = pageWidth - margin - sigWidth;
    doc.setFont("Amiri", "bold");
    doc.setFontSize(10);
    doc.text("المعتمد", approverX + sigWidth / 2, yPos, { align: "center" });
    yPos += 3;
    doc.line(approverX, yPos, approverX + sigWidth, yPos);
    yPos += 5;
    doc.setFont("Amiri", "normal");
    doc.setFontSize(8);
    doc.text("التوقيع", approverX + sigWidth / 2, yPos, { align: "center" });

    // التذييل
    const footerY = pageHeight - 20;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, footerY, pageWidth, 20, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Amiri", "normal");
    doc.setFontSize(9);
    
    if (orgSettings) {
      doc.text(
        `${orgSettings.organization_name_ar} | ${orgSettings.phone || ''} | ${orgSettings.email || ''}`,
        pageWidth / 2,
        footerY + 10,
        { align: "center" }
      );
      
      doc.setFontSize(8);
      doc.text(
        `الرقم الضريبي: ${orgSettings.vat_registration_number}`,
        pageWidth / 2,
        footerY + 16,
        { align: "center" }
      );
    }

    // إرجاع المستند بدلاً من الحفظ
    return doc;
  } catch (error) {
    logger.error(error, { context: 'generate_receipt_pdf', severity: 'high' });
    throw new Error("فشل في إنشاء ملف PDF: " + (error instanceof Error ? error.message : "خطأ غير معروف"));
  }
};