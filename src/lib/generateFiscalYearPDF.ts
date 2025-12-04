/**
 * مولّد تقرير PDF للسنة المالية
 */

import type { FiscalYearClosing } from "@/types/fiscal-year-closing";
import { logger } from "@/lib/logger";
import { loadAmiriFonts } from "./fonts/loadArabicFonts";

type JsPDF = import('jspdf').jsPDF;

const loadArabicFont = async (doc: JsPDF) => {
  try {
    const { regular: amiriRegular, bold: amiriBold } = await loadAmiriFonts();
    
    doc.addFileToVFS("Amiri-Regular.ttf", amiriRegular);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    
    doc.addFileToVFS("Amiri-Bold.ttf", amiriBold);
    doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
    
    doc.setFont("Amiri", "normal");
    return true;
  } catch (error) {
    logger.error(error, { 
      context: 'load_arabic_font_fiscal_year', 
      severity: 'low'
    });
    return false;
  }
};

export const generateFiscalYearPDF = async (
  closing: FiscalYearClosing,
  fiscalYearName: string
) => {
  try {
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    
    const jsPDF = jsPDFModule.default;
    const autoTable = autoTableModule.default;
    const doc = new jsPDF();
    
    const hasArabicFont = await loadArabicFont(doc);
    const fontName = hasArabicFont ? "Amiri" : "helvetica";
    
    doc.setR2L(true);
    doc.setLanguage("ar");

    // صفحة الغلاف
    doc.setDrawColor(66, 139, 202);
    doc.setLineWidth(3);
    doc.rect(10, 10, 190, 277);
    
    doc.setFillColor(66, 139, 202);
    doc.rect(10, 10, 190, 50, 'F');

    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont(fontName, "bold");
    doc.text(`تقرير السنة المالية`, 105, 35, { align: "center" });
    
    doc.setFontSize(20);
    doc.text(fiscalYearName, 105, 50, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text(`تاريخ الإقفال: ${new Date(closing.closing_date).toLocaleDateString('ar-SA')}`, 105, 80, { align: "center" });
    doc.text(`نوع الإقفال: ${closing.closing_type === 'automatic' ? 'تلقائي' : 'يدوي'}`, 105, 90, { align: "center" });

    // صفحة الملخص التنفيذي
    doc.addPage();
    
    doc.setDrawColor(66, 139, 202);
    doc.setLineWidth(2);
    doc.rect(10, 10, 190, 277);
    
    let yPos = 25;
    
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.setFont(fontName, "bold");
    doc.text("الملخص التنفيذي", 105, yPos, { align: "center" });
    yPos += 15;

    const summaryData = [
      ["إجمالي الإيرادات", `${closing.total_revenues.toLocaleString()} ر.س`],
      ["إجمالي المصروفات", `${closing.total_expenses.toLocaleString()} ر.س`],
      ["صافي الدخل", `${closing.net_income.toLocaleString()} ر.س`],
      ["رقبة الوقف (الفائض)", `${closing.waqf_corpus.toLocaleString()} ر.س`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["البيان", "المبلغ"]],
      body: summaryData,
      theme: 'grid',
      styles: { 
        font: fontName,
        halign: "right",
        fontSize: 12,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // الحصص والاستقطاعات
    doc.setFontSize(14);
    doc.setFont(fontName, "bold");
    doc.text("الحصص والاستقطاعات", 190, yPos, { align: "right" });
    yPos += 8;

    const sharesData = [
      ["حصة الناظر", `${closing.nazer_share.toLocaleString()} ر.س`, `${closing.nazer_percentage}%`],
      ["حصة الواقف", `${closing.waqif_share.toLocaleString()} ر.س`, `${closing.waqif_percentage}%`],
      ["توزيعات المستفيدين", `${closing.total_beneficiary_distributions.toLocaleString()} ر.س`, "-"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["النوع", "المبلغ", "النسبة"]],
      body: sharesData,
      theme: 'grid',
      styles: { 
        font: fontName,
        halign: "right",
        fontSize: 11,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [40, 167, 69],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // المصروفات التفصيلية
    doc.setFontSize(14);
    doc.setFont(fontName, "bold");
    doc.text("تفصيل المصروفات", 190, yPos, { align: "right" });
    yPos += 8;

    const expensesData = [
      ["مصروفات إدارية", `${closing.administrative_expenses.toLocaleString()} ر.س`],
      ["مصروفات صيانة", `${closing.maintenance_expenses.toLocaleString()} ر.س`],
      ["مصروفات تطوير", `${closing.development_expenses.toLocaleString()} ر.س`],
      ["مصروفات أخرى", `${closing.other_expenses.toLocaleString()} ر.س`],
      ["الإجمالي", `${closing.total_expenses.toLocaleString()} ر.س`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["نوع المصروف", "المبلغ"]],
      body: expensesData,
      theme: 'grid',
      styles: { 
        font: fontName,
        halign: "right",
        fontSize: 11,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [220, 53, 69],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { left: 20, right: 20 },
    });

    // صفحة الضرائب والزكاة
    doc.addPage();
    
    doc.setDrawColor(66, 139, 202);
    doc.setLineWidth(2);
    doc.rect(10, 10, 190, 277);
    
    yPos = 25;
    
    doc.setFontSize(18);
    doc.setFont(fontName, "bold");
    doc.text("الضرائب والزكاة", 105, yPos, { align: "center" });
    yPos += 15;

    const taxData = [
      ["ضريبة القيمة المضافة المحصلة", `${closing.total_vat_collected.toLocaleString()} ر.س`],
      ["ضريبة القيمة المضافة المدفوعة", `${closing.total_vat_paid.toLocaleString()} ر.س`],
      ["صافي الضريبة", `${closing.net_vat.toLocaleString()} ر.س`],
      ["الزكاة", `${closing.zakat_amount.toLocaleString()} ر.س`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["البيان", "المبلغ"]],
      body: taxData,
      theme: 'grid',
      styles: { 
        font: fontName,
        halign: "right",
        fontSize: 11,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [255, 193, 7],
        textColor: [33, 37, 41],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { left: 20, right: 20 },
    });

    // توزيعات الورثة
    if (closing.heir_distributions && closing.heir_distributions.length > 0) {
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      doc.setFontSize(14);
      doc.setFont(fontName, "bold");
      doc.text("توزيعات الورثة", 190, yPos, { align: "right" });
      yPos += 8;

      const heirsData = closing.heir_distributions.map(heir => [
        heir.heir_name,
        heir.heir_type,
        `${heir.share_amount.toLocaleString()} ر.س`,
        heir.share_percentage ? `${heir.share_percentage}%` : "-"
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["الاسم", "نوع الوارث", "المبلغ", "النسبة"]],
        body: heirsData,
        theme: 'grid',
        styles: { 
          font: fontName,
          halign: "right",
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [23, 162, 184],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        margin: { left: 15, right: 15 },
      });
    }

    // صفحة المركز المالي
    doc.addPage();
    
    doc.setDrawColor(66, 139, 202);
    doc.setLineWidth(2);
    doc.rect(10, 10, 190, 277);
    
    yPos = 25;
    
    doc.setFontSize(18);
    doc.setFont(fontName, "bold");
    doc.text("المركز المالي الختامي", 105, yPos, { align: "center" });
    yPos += 15;

    const balanceData = [
      ["الرصيد الافتتاحي", `${closing.opening_balance.toLocaleString()} ر.س`],
      ["إجمالي الإيرادات", `${closing.total_revenues.toLocaleString()} ر.س`],
      ["إجمالي المصروفات", `${closing.total_expenses.toLocaleString()} ر.س`],
      ["الرصيد الختامي", `${closing.closing_balance.toLocaleString()} ر.س`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["البيان", "المبلغ"]],
      body: balanceData,
      theme: 'grid',
      styles: { 
        font: fontName,
        halign: "right",
        fontSize: 12,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { left: 20, right: 20 },
    });

    // التذييل لكل الصفحات
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont(fontName, "normal");
      doc.setFontSize(9);
      doc.setTextColor(108, 117, 125);
      
      // خط فاصل
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(20, 280, 190, 280);
      
      doc.text(
        `تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')}`,
        105,
        285,
        { align: "center" }
      );
      doc.text(
        `صفحة ${i} من ${pageCount}`,
        105,
        290,
        { align: "center" }
      );
    }

    // حفظ الملف
    doc.save(`تقرير-السنة-المالية-${fiscalYearName}.pdf`);
  } catch (error) {
    logger.error(error, { 
      context: 'generate_fiscal_year_pdf', 
      severity: 'medium'
    });
    throw error;
  }
};
