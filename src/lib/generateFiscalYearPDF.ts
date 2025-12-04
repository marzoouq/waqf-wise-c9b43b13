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
  const [jsPDFModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  
  const jsPDF = jsPDFModule.default;
  const doc = new jsPDF();
  
  await loadArabicFont(doc);
  
  doc.setR2L(true);
  doc.setLanguage("ar");

  let yPos = 20;

  // الغلاف
  doc.setFontSize(24);
  doc.setTextColor(40, 40, 40);
  doc.text(`تقرير السنة المالية`, 105, yPos, { align: "center" });
  
  yPos += 12;
  doc.setFontSize(18);
  doc.setTextColor(66, 139, 202);
  doc.text(fiscalYearName, 105, yPos, { align: "center" });
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`تاريخ الإقفال: ${new Date(closing.closing_date).toLocaleDateString('ar-SA')}`, 105, yPos, { align: "center" });
  doc.text(`نوع الإقفال: ${closing.closing_type === 'automatic' ? 'تلقائي' : 'يدوي'}`, 105, yPos + 7, { align: "center" });

  // صفحة جديدة - الملخص التنفيذي
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text("الملخص التنفيذي", 200, yPos, { align: "right" });
  yPos += 10;

  const summaryData = [
    ["إجمالي الإيرادات", `${closing.total_revenues.toLocaleString()} ر.س`],
    ["إجمالي المصروفات", `${closing.total_expenses.toLocaleString()} ر.س`],
    ["صافي الدخل", `${closing.net_income.toLocaleString()} ر.س`],
    ["رقبة الوقف (الفائض)", `${closing.waqf_corpus.toLocaleString()} ر.س`],
  ];

  doc.autoTable({
    startY: yPos,
    head: [["البيان", "المبلغ"]],
    body: summaryData,
    styles: { 
      font: "Amiri",
      halign: "right",
      fontSize: 11,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: [255, 255, 255],
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // الحصص والاستقطاعات
  doc.setFontSize(14);
  doc.text("الحصص والاستقطاعات", 200, yPos, { align: "right" });
  yPos += 7;

  const sharesData = [
    ["حصة الناظر", `${closing.nazer_share.toLocaleString()} ر.س`, `${closing.nazer_percentage}%`],
    ["حصة الواقف", `${closing.waqif_share.toLocaleString()} ر.س`, `${closing.waqif_percentage}%`],
    ["توزيعات المستفيدين", `${closing.total_beneficiary_distributions.toLocaleString()} ر.س`, "-"],
  ];

  doc.autoTable({
    startY: yPos,
    head: [["النوع", "المبلغ", "النسبة"]],
    body: sharesData,
    styles: { 
      font: "Amiri",
      halign: "right",
      fontSize: 10,
    },
    headStyles: {
      fillColor: [92, 184, 92],
      textColor: [255, 255, 255],
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // المصروفات التفصيلية
  doc.setFontSize(14);
  doc.text("تفصيل المصروفات", 200, yPos, { align: "right" });
  yPos += 7;

  const expensesData = [
    ["مصروفات إدارية", `${closing.administrative_expenses.toLocaleString()} ر.س`],
    ["مصروفات صيانة", `${closing.maintenance_expenses.toLocaleString()} ر.س`],
    ["مصروفات تطوير", `${closing.development_expenses.toLocaleString()} ر.س`],
    ["مصروفات أخرى", `${closing.other_expenses.toLocaleString()} ر.س`],
    ["الإجمالي", `${closing.total_expenses.toLocaleString()} ر.س`],
  ];

  doc.autoTable({
    startY: yPos,
    head: [["نوع المصروف", "المبلغ"]],
    body: expensesData,
    styles: { 
      font: "Amiri",
      halign: "right",
      fontSize: 10,
    },
    headStyles: {
      fillColor: [217, 83, 79],
      textColor: [255, 255, 255],
    },
  });

  // صفحة جديدة - الضرائب والزكاة
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(14);
  doc.text("الضرائب والزكاة", 200, yPos, { align: "right" });
  yPos += 7;

  const taxData = [
    ["ضريبة القيمة المضافة المحصلة", `${closing.total_vat_collected.toLocaleString()} ر.س`],
    ["ضريبة القيمة المضافة المدفوعة", `${closing.total_vat_paid.toLocaleString()} ر.س`],
    ["صافي الضريبة", `${closing.net_vat.toLocaleString()} ر.س`],
    ["الزكاة", `${closing.zakat_amount.toLocaleString()} ر.س`],
  ];

  doc.autoTable({
    startY: yPos,
    head: [["البيان", "المبلغ"]],
    body: taxData,
    styles: { 
      font: "Amiri",
      halign: "right",
      fontSize: 10,
    },
    headStyles: {
      fillColor: [240, 173, 78],
      textColor: [255, 255, 255],
    },
  });

  // توزيعات الورثة
  if (closing.heir_distributions && closing.heir_distributions.length > 0) {
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(14);
    doc.text("توزيعات الورثة", 200, yPos, { align: "right" });
    yPos += 7;

    const heirsData = closing.heir_distributions.map(heir => [
      heir.heir_name,
      heir.heir_type,
      `${heir.share_amount.toLocaleString()} ر.س`,
      heir.share_percentage ? `${heir.share_percentage}%` : "-"
    ]);

    doc.autoTable({
      startY: yPos,
      head: [["الاسم", "نوع الوارث", "المبلغ", "النسبة"]],
      body: heirsData,
      styles: { 
        font: "Amiri",
        halign: "right",
        fontSize: 9,
      },
      headStyles: {
        fillColor: [91, 192, 222],
        textColor: [255, 255, 255],
      },
    });
  }

  // صفحة جديدة - المركز المالي
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(14);
  doc.text("المركز المالي الختامي", 200, yPos, { align: "right" });
  yPos += 7;

  const balanceData = [
    ["الرصيد الافتتاحي", `${closing.opening_balance.toLocaleString()} ر.س`],
    ["إجمالي الإيرادات", `${closing.total_revenues.toLocaleString()} ر.س`],
    ["إجمالي المصروفات", `${closing.total_expenses.toLocaleString()} ر.س`],
    ["الرصيد الختامي", `${closing.closing_balance.toLocaleString()} ر.س`],
  ];

  doc.autoTable({
    startY: yPos,
    head: [["البيان", "المبلغ"]],
    body: balanceData,
    styles: { 
      font: "Amiri",
      halign: "right",
      fontSize: 11,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: [255, 255, 255],
    },
  });

  // التذييل
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
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
};
