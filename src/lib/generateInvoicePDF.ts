import jsPDF from "jspdf";
import "jspdf-autotable";
import QRCode from "qrcode";
import { formatZATCACurrency, formatVATNumber } from "./zatca";
import type { OrganizationSettings } from "@/hooks/useOrganizationSettings";

// Type definitions for jspdf-autotable
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
    autoTable: (options: any) => jsPDF;
  }
}

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
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  let yPos = margin;

  // ألوان
  const primaryColor: [number, number, number] = [41, 128, 185]; // أزرق
  const secondaryColor: [number, number, number] = [52, 73, 94]; // رمادي غامق
  const lightGray: [number, number, number] = [236, 240, 241];

  // خلفية الهيدر
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 50, "F");

  // عنوان الفاتورة
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("فاتورة ضريبية", pageWidth / 2, 20, { align: "center" });
  doc.text("Tax Invoice", pageWidth / 2, 30, { align: "center" });

  // رقم الفاتورة والتاريخ
  doc.setFontSize(10);
  doc.text(`رقم الفاتورة: ${invoice.invoice_number}`, pageWidth - margin, 40, {
    align: "right",
  });
  doc.text(
    `التاريخ: ${new Date(invoice.invoice_date).toLocaleDateString("ar-SA")}${
      invoice.invoice_time ? " | " + invoice.invoice_time : ""
    }`,
    pageWidth - margin,
    45,
    { align: "right" }
  );

  yPos = 60;

  // معلومات البائع والمشتري
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(11);

  // البائع (يسار)
  const sellerX = margin;
  doc.setFont(undefined, "bold");
  doc.text("معلومات البائع", sellerX, yPos);
  doc.setFont(undefined, "normal");
  doc.setFontSize(9);

  if (orgSettings) {
    yPos += 6;
    doc.text(orgSettings.organization_name_ar, sellerX, yPos);
    yPos += 5;
    doc.text(
      `الرقم الضريبي: ${formatVATNumber(orgSettings.vat_registration_number)}`,
      sellerX,
      yPos
    );
    yPos += 5;
    doc.text(
      `السجل التجاري: ${orgSettings.commercial_registration_number}`,
      sellerX,
      yPos
    );
    yPos += 5;
    doc.text(`العنوان: ${orgSettings.address_ar}`, sellerX, yPos);
    yPos += 5;
    doc.text(`المدينة: ${orgSettings.city}`, sellerX, yPos);
    if (orgSettings.phone) {
      yPos += 5;
      doc.text(`الهاتف: ${orgSettings.phone}`, sellerX, yPos);
    }
  }

  // المشتري (يمين)
  yPos = 60;
  const buyerX = pageWidth - margin;
  doc.setFont(undefined, "bold");
  doc.setFontSize(11);
  doc.text("معلومات المشتري", buyerX, yPos, { align: "right" });
  doc.setFont(undefined, "normal");
  doc.setFontSize(9);

  yPos += 6;
  doc.text(invoice.customer_name, buyerX, yPos, { align: "right" });

  if (invoice.customer_vat_number) {
    yPos += 5;
    doc.text(
      `الرقم الضريبي: ${formatVATNumber(invoice.customer_vat_number)}`,
      buyerX,
      yPos,
      { align: "right" }
    );
  }

  if (invoice.customer_commercial_registration) {
    yPos += 5;
    doc.text(
      `السجل التجاري: ${invoice.customer_commercial_registration}`,
      buyerX,
      yPos,
      { align: "right" }
    );
  }

  if (invoice.customer_address) {
    yPos += 5;
    doc.text(`العنوان: ${invoice.customer_address}`, buyerX, yPos, {
      align: "right",
    });
  }

  if (invoice.customer_city) {
    yPos += 5;
    doc.text(`المدينة: ${invoice.customer_city}`, buyerX, yPos, {
      align: "right",
    });
  }

  if (invoice.customer_phone) {
    yPos += 5;
    doc.text(`الهاتف: ${invoice.customer_phone}`, buyerX, yPos, {
      align: "right",
    });
  }

  yPos += 15;

  // جدول البنود
  const tableHeaders = [
    ["الإجمالي", "ض.ق.م", "نسبة ض.ق.م", "المجموع", "السعر", "الكمية", "الوصف"],
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

  (doc as any).autoTable({
    startY: yPos,
    head: tableHeaders,
    body: tableData,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { halign: "right", cellWidth: 25 },
      1: { halign: "right", cellWidth: 20 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "right", cellWidth: 25 },
      4: { halign: "right", cellWidth: 25 },
      5: { halign: "center", cellWidth: 15 },
      6: { halign: "right", cellWidth: "auto" },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // الملخص المالي
  const summaryX = pageWidth - margin - 60;
  const summaryWidth = 60;

  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(summaryX, yPos, summaryWidth, 25, "F");

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(10);

  yPos += 6;
  doc.text("المجموع (غير شامل ض.ق.م):", summaryX + 5, yPos);
  doc.text(
    `${formatZATCACurrency(invoice.subtotal)} ريال`,
    summaryX + summaryWidth - 5,
    yPos,
    { align: "right" }
  );

  yPos += 6;
  doc.text("ضريبة القيمة المضافة:", summaryX + 5, yPos);
  doc.text(
    `${formatZATCACurrency(invoice.tax_amount)} ريال`,
    summaryX + summaryWidth - 5,
    yPos,
    { align: "right" }
  );

  yPos += 1;
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.line(summaryX + 5, yPos, summaryX + summaryWidth - 5, yPos);

  yPos += 6;
  doc.setFont(undefined, "bold");
  doc.setFontSize(11);
  doc.text("الإجمالي (شامل ض.ق.م):", summaryX + 5, yPos);
  doc.text(
    `${formatZATCACurrency(invoice.total_amount)} ريال`,
    summaryX + summaryWidth - 5,
    yPos,
    { align: "right" }
  );

  yPos += 15;

  // الملاحظات
  if (invoice.notes) {
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    doc.text("ملاحظات:", margin, yPos);
    yPos += 5;
    doc.text(invoice.notes, margin, yPos, { maxWidth: pageWidth - 2 * margin });
    yPos += 10;
  }

  // QR Code (إذا كان موجوداً)
  if (invoice.qr_code_data) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(invoice.qr_code_data, {
        width: 150,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      // إضافة عنوان QR Code
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text("رمز الاستجابة السريعة - QR Code", margin, yPos);
      yPos += 7;

      // إضافة صورة QR Code
      doc.addImage(qrCodeDataUrl, "PNG", margin, yPos, 40, 40);
      
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text(
        "(امسح الرمز للتحقق من صحة الفاتورة)",
        margin + 45,
        yPos + 20
      );
      
      yPos += 45;
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  }

  // التذييل
  const footerY = pageHeight - 20;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, footerY, pageWidth, 20, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  if (orgSettings) {
    doc.text(
      `${orgSettings.organization_name_ar} | ${
        orgSettings.phone || ""
      } | ${orgSettings.email || ""}`,
      pageWidth / 2,
      footerY + 10,
      { align: "center" }
    );
    doc.text(
      `الرقم الضريبي: ${formatVATNumber(orgSettings.vat_registration_number)}`,
      pageWidth / 2,
      footerY + 15,
      { align: "center" }
    );
  }

  // حفظ الملف
  doc.save(`Invoice-${invoice.invoice_number}.pdf`);
};
