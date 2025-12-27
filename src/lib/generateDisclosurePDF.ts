/**
 * مولّد تقرير الإفصاح السنوي PDF
 * @version 3.0.0 - Visual RTL + ترويسة رسمية + ختم الناظر
 */

import { AnnualDisclosure } from "@/hooks/reports/useAnnualDisclosures";
import { Database } from "@/integrations/supabase/types";
import { logger } from "@/lib/logger";
import { 
  loadArabicFontToPDF, 
  WAQF_COLORS, 
  processArabicText, 
  processArabicHeaders, 
  processArabicTableData,
  addWaqfHeader,
  addWaqfFooter,
  addNazerStamp
} from "./pdf/arabic-pdf-utils";

type DisclosureBeneficiary = Database['public']['Tables']['disclosure_beneficiaries']['Row'];

type JsPDF = import('jspdf').jsPDF;

/**
 * تنسيق الأرقام بشكل موحد للـ PDF
 */
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

const formatCurrency = (num: number): string => {
  return `${formatNumber(num)} ر.س`;
};

const formatPercentage = (num: number): string => {
  return `${num}%`;
};

// Type Augmentation for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
  }
}

export const generateDisclosurePDF = async (
  disclosure: AnnualDisclosure,
  beneficiaries: DisclosureBeneficiary[] = []
) => {
  try {
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    
    const jsPDF = jsPDFModule.default;
    const autoTable = autoTableModule.default;
    const doc = new jsPDF();
    
    // تحميل الخط العربي
    const fontName = await loadArabicFontToPDF(doc);

    // ========= الصفحة الأولى =========
    
    // الإطار الرئيسي
    doc.setDrawColor(...WAQF_COLORS.primary);
    doc.setLineWidth(2);
    doc.rect(10, 10, 190, 277);

    // ترويسة الوقف الرسمية
    let yPos = addWaqfHeader(doc, fontName, `الإفصاح السنوي ${disclosure.year}`);
    
    // اسم الوقف
    doc.setFont(fontName, "bold");
    doc.setFontSize(14);
    doc.setTextColor(...WAQF_COLORS.text);
    doc.text(processArabicText(disclosure.waqf_name), 105, yPos, { align: "center" });
    yPos += 12;

    // ========= الملخص المالي =========
    doc.setFont(fontName, "bold");
    doc.setFontSize(13);
    doc.setTextColor(...WAQF_COLORS.text);
    doc.text(processArabicText("الملخص المالي السنوي"), 190, yPos, { align: "right" });
    yPos += 8;

    const financialData = processArabicTableData([
      ["إجمالي الإيرادات", formatCurrency(disclosure.total_revenues)],
      ["إجمالي المصروفات", formatCurrency(disclosure.total_expenses)],
      ["صافي الدخل", formatCurrency(disclosure.net_income)],
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [processArabicHeaders(["البيان", "المبلغ"])],
      body: financialData,
      theme: 'grid',
      styles: { 
        font: fontName,
        halign: "right",
        fontSize: 11,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: WAQF_COLORS.primary,
        textColor: WAQF_COLORS.white,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: WAQF_COLORS.alternateRow,
      },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 10;

    // ========= نسب التوزيع =========
    doc.setFont(fontName, "bold");
    doc.setFontSize(13);
    doc.text(processArabicText("نسب وحصص التوزيع"), 190, yPos, { align: "right" });
    yPos += 8;

    const distributionData = processArabicTableData([
      ["حصة الناظر", formatCurrency(disclosure.nazer_share), formatPercentage(disclosure.nazer_percentage)],
      ["صدقة الواقف", formatCurrency(disclosure.charity_share), formatPercentage(disclosure.charity_percentage)],
      ["رأس مال الوقف", formatCurrency(disclosure.corpus_share), formatPercentage(disclosure.corpus_percentage)],
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [processArabicHeaders(["النوع", "المبلغ", "النسبة"])],
      body: distributionData,
      theme: 'grid',
      styles: { 
        font: fontName,
        halign: "right",
        fontSize: 11,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [40, 167, 69],
        textColor: WAQF_COLORS.white,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: WAQF_COLORS.alternateRow,
      },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 10;

    // ========= إحصائيات المستفيدين =========
    doc.setFont(fontName, "bold");
    doc.setFontSize(13);
    doc.text(processArabicText("إحصائيات المستفيدين"), 190, yPos, { align: "right" });
    yPos += 8;

    const beneficiaryStats = processArabicTableData([
      ["عدد الأبناء", disclosure.sons_count.toString()],
      ["عدد البنات", disclosure.daughters_count.toString()],
      ["عدد الزوجات", disclosure.wives_count.toString()],
      ["الإجمالي", disclosure.total_beneficiaries.toString()],
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [processArabicHeaders(["الفئة", "العدد"])],
      body: beneficiaryStats,
      theme: 'grid',
      styles: { 
        font: fontName,
        halign: "right",
        fontSize: 11,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [255, 193, 7],
        textColor: WAQF_COLORS.text,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: WAQF_COLORS.alternateRow,
      },
      margin: { left: 20, right: 20 },
    });

    // ========= صفحة المستفيدين =========
    if (beneficiaries.length > 0) {
      doc.addPage();
      
      // الإطار
      doc.setDrawColor(...WAQF_COLORS.primary);
      doc.setLineWidth(2);
      doc.rect(10, 10, 190, 277);
      
      yPos = 25;
      
      doc.setFont(fontName, "bold");
      doc.setFontSize(16);
      doc.setTextColor(...WAQF_COLORS.text);
      doc.text(processArabicText("قائمة المستفيدين وحصصهم"), 105, yPos, { align: "center" });
      yPos += 12;

      const beneficiariesData = processArabicTableData(beneficiaries.map(b => [
        b.beneficiary_name,
        b.beneficiary_type || "-",
        b.relationship || "-",
        formatCurrency(b.allocated_amount),
        b.payments_count.toString(),
      ]));

      autoTable(doc, {
        startY: yPos,
        head: [processArabicHeaders(["الاسم", "النوع", "القرابة", "المبلغ المخصص", "عدد الدفعات"])],
        body: beneficiariesData,
        theme: 'grid',
        styles: { 
          font: fontName,
          halign: "right",
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [220, 53, 69],
          textColor: WAQF_COLORS.white,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: WAQF_COLORS.alternateRow,
        },
        margin: { left: 15, right: 15 },
      });
    }

    // ========= صفحة المصروفات التفصيلية =========
    if (disclosure.maintenance_expenses || disclosure.administrative_expenses || 
        disclosure.development_expenses || disclosure.other_expenses) {
      doc.addPage();
      
      // الإطار
      doc.setDrawColor(...WAQF_COLORS.primary);
      doc.setLineWidth(2);
      doc.rect(10, 10, 190, 277);
      
      yPos = 25;
      
      doc.setFont(fontName, "bold");
      doc.setFontSize(16);
      doc.setTextColor(...WAQF_COLORS.text);
      doc.text(processArabicText("تفصيل المصروفات"), 105, yPos, { align: "center" });
      yPos += 12;

      const expensesDataRaw: string[][] = [];
      if (disclosure.maintenance_expenses) {
        expensesDataRaw.push(["مصروفات الصيانة", formatCurrency(disclosure.maintenance_expenses)]);
      }
      if (disclosure.administrative_expenses) {
        expensesDataRaw.push(["مصروفات إدارية", formatCurrency(disclosure.administrative_expenses)]);
      }
      if (disclosure.development_expenses) {
        expensesDataRaw.push(["مصروفات التطوير", formatCurrency(disclosure.development_expenses)]);
      }
      if (disclosure.other_expenses) {
        expensesDataRaw.push(["مصروفات أخرى", formatCurrency(disclosure.other_expenses)]);
      }

      const expensesData = processArabicTableData(expensesDataRaw);

      autoTable(doc, {
        startY: yPos,
        head: [processArabicHeaders(["نوع المصروف", "المبلغ"])],
        body: expensesData,
        theme: 'grid',
        styles: { 
          font: fontName,
          halign: "right",
          fontSize: 11,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [23, 162, 184],
          textColor: WAQF_COLORS.white,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: WAQF_COLORS.alternateRow,
        },
        margin: { left: 20, right: 20 },
      });
    }

    // ========= التذييل وختم الناظر لكل الصفحات =========
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // ختم الناظر في الصفحة الأولى فقط
      if (i === 1) {
        await addNazerStamp(doc, fontName, { nazerName: "ناظر الوقف" });
      }
      
      // التذييل
      addWaqfFooter(doc, fontName);
      
      // رقم الصفحة
      doc.setFont(fontName, "normal");
      doc.setFontSize(9);
      doc.setTextColor(...WAQF_COLORS.muted);
      doc.text(
        processArabicText(`صفحة ${i} من ${pageCount}`),
        105,
        290,
        { align: "center" }
      );
    }

    // حفظ الملف
    doc.save(`إفصاح-سنوي-${disclosure.year}-${disclosure.waqf_name}.pdf`);
  } catch (error) {
    logger.error(error, { 
      context: 'generate_disclosure_pdf', 
      severity: 'medium'
    });
    throw error;
  }
};
