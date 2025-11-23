import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import { formatZATCACurrency, formatVATNumber } from "./zatca";
import type { OrganizationSettings } from "@/hooks/useOrganizationSettings";
import { loadAmiriFonts } from "./fonts/loadArabicFonts";
import { logger } from "./logger";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_time?: string;
  customer_name: string;
  customer_address?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_vat_number?: string;
  customer_commercial_registration?: string;
  customer_city?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  qr_code_data?: string;
}

interface InvoiceLine {
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
}

export const generateInvoicePDF = async (
  invoice: Invoice,
  lines: InvoiceLine[],
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

    // تسجيل الخطوط العربية في jsPDF
    doc.addFileToVFS("Amiri-Regular.ttf", amiriRegular);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    
    doc.addFileToVFS("Amiri-Bold.ttf", amiriBold);
    doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
    
    // تعيين الخط الافتراضي
    doc.setFont("Amiri", "normal");

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let yPos = margin;

    // ألوان
    const primaryColor: [number, number, number] = [41, 128, 185]; // أزرق
    const secondaryColor: [number, number, number] = [52, 73, 94]; // رمادي غامق
    const lightGray: [number, number, number] = [236, 240, 241];

    // خلفية الهيدر المحسنة
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 55, "F");
    
    // إضافة خط زخرفي أسفل الهيدر
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(0, 53, pageWidth, 53);

  // عنوان الفاتورة
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("Amiri", "bold");
  doc.text("فاتورة ضريبية", pageWidth / 2, 22, { align: "center" });
  
  doc.setFontSize(11);
  doc.setFont("Amiri", "normal");
  doc.text("Tax Invoice", pageWidth / 2, 32, { align: "center" });

  // رقم الفاتورة والتاريخ في صندوق
  doc.setFontSize(9);
  doc.setFont("Amiri", "normal");
  doc.text(`رقم الفاتورة: ${invoice.invoice_number}`, pageWidth - margin, 42, {
    align: "right",
  });
  doc.text(
    `التاريخ: ${new Date(invoice.invoice_date).toLocaleDateString("ar-SA")}${
      invoice.invoice_time ? " | " + invoice.invoice_time : ""
    }`,
    pageWidth - margin,
    48,
    { align: "right" }
  );

  yPos = 65;

  // معلومات البائع والمشتري - تحسين التنسيق
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(11);

  // البائع (يسار)
  const sellerX = margin;
  doc.setFont("Amiri", "bold");
  doc.text("معلومات البائع", sellerX, yPos);
  doc.setFont("Amiri", "normal");
  doc.setFontSize(9);

  if (orgSettings) {
    yPos += 7;
    doc.text(orgSettings.organization_name_ar, sellerX, yPos);
    yPos += 6;
    doc.text(
      `الرقم الضريبي: ${formatVATNumber(orgSettings.vat_registration_number)}`,
      sellerX,
      yPos
    );
    yPos += 6;
    doc.text(
      `السجل التجاري: ${orgSettings.commercial_registration_number}`,
      sellerX,
      yPos
    );
    yPos += 6;
    doc.text(`العنوان: ${orgSettings.address_ar}`, sellerX, yPos);
    yPos += 6;
    doc.text(`المدينة: ${orgSettings.city}`, sellerX, yPos);
    if (orgSettings.phone) {
      yPos += 6;
      doc.text(`الهاتف: ${orgSettings.phone}`, sellerX, yPos);
    }
  }

  // المشتري (يمين)
  yPos = 60;
  const buyerX = pageWidth - margin;
  doc.setFont("Amiri", "bold");
  doc.setFontSize(11);
  doc.text("معلومات المشتري", buyerX, yPos, { align: "right" });
  doc.setFont("Amiri", "normal");
  doc.setFontSize(9);

  yPos += 7;
  doc.text(invoice.customer_name, buyerX, yPos, { align: "right" });

  if (invoice.customer_vat_number) {
    yPos += 6;
    doc.text(
      `الرقم الضريبي: ${formatVATNumber(invoice.customer_vat_number)}`,
      buyerX,
      yPos,
      { align: "right" }
    );
  }

  if (invoice.customer_commercial_registration) {
    yPos += 6;
    doc.text(
      `السجل التجاري: ${invoice.customer_commercial_registration}`,
      buyerX,
      yPos,
      { align: "right" }
    );
  }

  if (invoice.customer_address) {
    yPos += 6;
    doc.text(`العنوان: ${invoice.customer_address}`, buyerX, yPos, {
      align: "right",
    });
  }

  if (invoice.customer_city) {
    yPos += 6;
    doc.text(`المدينة: ${invoice.customer_city}`, buyerX, yPos, {
      align: "right",
    });
  }

  if (invoice.customer_phone) {
    yPos += 6;
    doc.text(`الهاتف: ${invoice.customer_phone}`, buyerX, yPos, {
      align: "right",
    });
  }

  yPos += 20;

  // جدول البنود - تحسين التنسيق
  const tableHeaders = [
    ["الإجمالي", "ض.ق.م", "نسبة الضريبة", "المجموع", "السعر", "الكمية", "البيان"],
  ];

  const tableData = lines.map((line) => [
    formatZATCACurrency(line.line_total),
    formatZATCACurrency(line.tax_amount),
    `${line.tax_rate}%`,
    formatZATCACurrency(line.subtotal),
    formatZATCACurrency(line.unit_price),
    line.quantity.toString(),
    line.description,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: tableHeaders,
    body: tableData,
    theme: "grid",
    styles: {
      font: "Amiri",
      fontSize: 9,
      cellPadding: 4,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
      font: "Amiri",
      halign: "center",
      valign: "middle",
      cellPadding: 5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 22, fontStyle: "bold" },
      1: { halign: "center", cellWidth: 18 },
      2: { halign: "center", cellWidth: 18 },
      3: { halign: "center", cellWidth: 22 },
      4: { halign: "center", cellWidth: 22 },
      5: { halign: "center", cellWidth: 15 },
      6: { halign: "right", cellWidth: "auto" },
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    margin: { left: margin, right: margin },
  });

  // @ts-expect-error - jspdf-autotable adds lastAutoTable property
  yPos = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : yPos;

  // الملخص المالي والـ QR Code في نفس المستوى
  const summaryWidth = 75;
  const summaryX = pageWidth - margin - summaryWidth;
  const summaryStartY = yPos;

  // رسم صندوق الإجمالي
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(summaryX, yPos, summaryWidth, 35, "F");
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(summaryX, yPos, summaryWidth, 35, "S");

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("Amiri", "normal");
  doc.setFontSize(9);

  let summaryYPos = yPos + 8;
  doc.text("المجموع (غير شامل ض.ق.م):", summaryX + 5, summaryYPos);
  doc.text(
    `${formatZATCACurrency(invoice.subtotal)} ريال`,
    summaryX + summaryWidth - 5,
    summaryYPos,
    { align: "right" }
  );

  summaryYPos += 8;
  doc.text("ضريبة القيمة المضافة (15%):", summaryX + 5, summaryYPos);
  doc.text(
    `${formatZATCACurrency(invoice.tax_amount)} ريال`,
    summaryX + summaryWidth - 5,
    summaryYPos,
    { align: "right" }
  );

  // خط فاصل
  summaryYPos += 3;
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setLineWidth(0.3);
  doc.line(summaryX + 5, summaryYPos, summaryX + summaryWidth - 5, summaryYPos);

  // الإجمالي النهائي
  summaryYPos += 7;
  doc.setFont("Amiri", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("الإجمالي الكلي:", summaryX + 5, summaryYPos);
  doc.text(
    `${formatZATCACurrency(invoice.total_amount)} ريال`,
    summaryX + summaryWidth - 5,
    summaryYPos,
    { align: "right" }
  );

  // QR Code بجانب صندوق الإجمالي (على اليسار)
  if (invoice.qr_code_data) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(invoice.qr_code_data, {
        width: 250,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      // صندوق QR Code
      const qrBoxWidth = 60;
      const qrBoxHeight = 70;
      const qrImageSize = 50;
      const qrBoxX = margin;
      const qrBoxY = summaryStartY;
      
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.setFillColor(255, 255, 255);
      doc.rect(qrBoxX, qrBoxY, qrBoxWidth, qrBoxHeight, "FD");

      // عنوان QR Code
      doc.setFontSize(10);
      doc.setFont("Amiri", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("رمز التحقق ZATCA", qrBoxX + qrBoxWidth / 2, qrBoxY + 6, { align: "center" });
      
      // إضافة صورة QR Code
      const qrX = qrBoxX + (qrBoxWidth - qrImageSize) / 2;
      const qrY = qrBoxY + 10;
      doc.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrImageSize, qrImageSize);
      
      doc.setFontSize(7);
      doc.setFont("Amiri", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(
        "امسح للتحقق من الفاتورة",
        qrBoxX + qrBoxWidth / 2,
        qrBoxY + qrBoxHeight - 4,
        { align: "center", maxWidth: qrBoxWidth - 4 }
      );
    } catch (error) {
      logger.error(error, { context: 'generate_qr_code', severity: 'low' });
    }
  }

  yPos = summaryStartY + Math.max(35, 70) + 10;

  // الملاحظات - تحسين التنسيق
  if (invoice.notes) {
    doc.setFont("Amiri", "bold");
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("ملاحظات:", margin, yPos);
    
    doc.setFont("Amiri", "normal");
    doc.setFontSize(9);
    yPos += 6;
    
    // تقسيم النص الطويل على أسطر متعددة
    const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin - 10);
    doc.text(noteLines, margin + 5, yPos);
    yPos += noteLines.length * 5 + 10;
  }

  // التذييل المحسن
  const footerY = pageHeight - 25;
  
  // خلفية التذييل مع تدرج
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, footerY, pageWidth, 25, "F");
  
  // خط زخرفي أعلى التذييل
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(0, footerY + 2, pageWidth, footerY + 2);

  doc.setTextColor(255, 255, 255);
  doc.setFont("Amiri", "normal");
  
  if (orgSettings) {
    // السطر الأول - معلومات التواصل
    doc.setFontSize(9);
    doc.text(
      `${orgSettings.organization_name_ar}`,
      pageWidth / 2,
      footerY + 9,
      { align: "center" }
    );
    
    // السطر الثاني - البريد والهاتف
    doc.setFontSize(8);
    const contactInfo = [
      orgSettings.phone || "",
      orgSettings.email || "",
    ].filter(Boolean).join(" | ");
    
    if (contactInfo) {
      doc.text(
        contactInfo,
        pageWidth / 2,
        footerY + 14,
        { align: "center" }
      );
    }
    
    // السطر الثالث - الرقم الضريبي
    doc.setFontSize(8);
    doc.text(
      `الرقم الضريبي: ${formatVATNumber(orgSettings.vat_registration_number)}`,
      pageWidth / 2,
      footerY + 20,
      { align: "center" }
    );
  }

    // إرجاع المستند بدلاً من الحفظ
    return doc;
  } catch (error) {
    logger.error(error, { context: 'generate_invoice_pdf', severity: 'high' });
    throw new Error("فشل في إنشاء ملف PDF: " + (error instanceof Error ? error.message : "خطأ غير معروف"));
  }
};
