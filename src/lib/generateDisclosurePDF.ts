/**
 * مولّد تقرير الإفصاح السنوي PDF
 * @version 2.9.75
 */

import { AnnualDisclosure } from "@/hooks/reports/useAnnualDisclosures";
import { Database } from "@/integrations/supabase/types";
import { logger } from "@/lib/logger";
import { loadArabicFontToPDF, WAQF_COLORS, processArabicText, processArabicHeaders, processArabicTableData } from "./pdf/arabic-pdf-utils";

type DisclosureBeneficiary = Database['public']['Tables']['disclosure_beneficiaries']['Row'];

type JsPDF = import('jspdf').jsPDF;

/**
 * تنسيق الأرقام بشكل موحد للـ PDF
 * يستخدم تنسيق عربي مع فاصلة للآلاف ونقطة للكسور
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
    
    // تحميل الخط العربي باستخدام النظام الموحد
    const fontName = await loadArabicFontToPDF(doc);

    let yPos = 20;

    // الإطار الرئيسي
    doc.setDrawColor(66, 139, 202);
    doc.setLineWidth(2);
    doc.rect(10, 10, 190, 277);

    // العنوان الرئيسي
    doc.setFont(fontName, "bold");
    doc.setFontSize(22);
    doc.setTextColor(33, 37, 41);
    doc.text(processArabicText("الإفصاح السنوي"), 105, yPos, { align: "center" });
    
    yPos += 10;
    doc.setFontSize(18);
    doc.setTextColor(66, 139, 202);
    doc.text(`${disclosure.year}`, 105, yPos, { align: "center" });
    
    yPos += 8;
    doc.setFontSize(14);
    doc.setTextColor(108, 117, 125);
    doc.text(processArabicText(disclosure.waqf_name), 105, yPos, { align: "center" });
    
    // خط فاصل
    yPos += 8;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    
    yPos += 10;

    // المعلومات المالية
    doc.setFont(fontName, "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 37, 41);
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
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { left: 20, right: 20 },
    });

    yPos = doc.lastAutoTable?.finalY ?? yPos + 12;

    // نسب التوزيع
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
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { left: 20, right: 20 },
    });

    yPos = doc.lastAutoTable?.finalY ?? yPos + 12;

    // إحصائيات المستفيدين
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
        textColor: [33, 37, 41],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { left: 20, right: 20 },
    });

    // صفحة جديدة للمستفيدين إذا كانوا موجودين
    if (beneficiaries.length > 0) {
      doc.addPage();
      
      // الإطار
      doc.setDrawColor(66, 139, 202);
      doc.setLineWidth(2);
      doc.rect(10, 10, 190, 277);
      
      yPos = 25;
      
      doc.setFont(fontName, "bold");
      doc.setFontSize(16);
      doc.setTextColor(33, 37, 41);
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
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        margin: { left: 15, right: 15 },
      });
    }

    // المصروفات التفصيلية
    if (disclosure.maintenance_expenses || disclosure.administrative_expenses || 
        disclosure.development_expenses || disclosure.other_expenses) {
      doc.addPage();
      
      // الإطار
      doc.setDrawColor(66, 139, 202);
      doc.setLineWidth(2);
      doc.rect(10, 10, 190, 277);
      
      yPos = 25;
      
      doc.setFont(fontName, "bold");
      doc.setFontSize(16);
      doc.setTextColor(33, 37, 41);
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
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        margin: { left: 20, right: 20 },
      });
    }

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
        processArabicText(`تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')}`),
        105,
        285,
        { align: "center" }
      );
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
