/**
 * مولّد تقرير الإفصاح السنوي PDF
 * @version 4.0.0 - تفاصيل كاملة مطابقة للطباعة
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

// ترجمة أسماء المصروفات
const expenseNameTranslations: Record<string, string> = {
  'audit_2024': 'تدقيق 2024',
  'audit_2025': 'تدقيق 2025',
  'cleaning_worker': 'عامل نظافة',
  'ejar_platform': 'منصة إيجار',
  'electrical_works': 'أعمال كهربائية',
  'electricity_bills': 'فواتير الكهرباء',
  'electricity_maintenance': 'صيانة كهربائية',
  'gypsum_works': 'أعمال جبس',
  'miscellaneous': 'مصروفات متنوعة',
  'plumbing_maintenance': 'صيانة سباكة',
  'plumbing_works': 'أعمال سباكة',
  'rental_commission': 'عمولة إيجار',
  'water_bills': 'فواتير المياه',
  'zakat': 'الزكاة',
  'maintenance': 'مصروفات الصيانة',
  'administrative': 'مصروفات إدارية',
  'development': 'مصروفات التطوير',
  'other': 'مصروفات أخرى',
};

// ترجمة أسماء الإيرادات
const revenueNameTranslations: Record<string, string> = {
  'jeddah_properties': 'عقارات جدة',
  'nahdi_rental': 'إيجار النهدي',
  'remaining_2024': 'متبقي 2024',
  'residential_monthly': 'الإيجارات السكنية الشهرية',
  'rental_income': 'إيرادات الإيجار',
  'investment_returns': 'عوائد الاستثمار',
  'other_income': 'إيرادات أخرى',
};

const translateExpenseName = (name: string): string => {
  return expenseNameTranslations[name.toLowerCase().trim()] || name;
};

const translateRevenueName = (name: string): string => {
  return revenueNameTranslations[name.toLowerCase().trim()] || name;
};

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
  return `${num.toFixed(1)}%`;
};

// Type Augmentation for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
  }
}

interface ExpenseItem {
  name: string;
  amount: number;
}

interface RevenueItem {
  name: string;
  amount: number;
}

interface BeneficiariesDetails {
  distributions?: {
    total: number;
    sons_share: number;
    daughters_share: number;
    wives_share: number;
    heirs_count: number;
    sons_count?: number;
    daughters_count?: number;
    wives_count?: number;
  };
}

export const generateDisclosurePDF = async (
  disclosure: AnnualDisclosure,
  beneficiaries: DisclosureBeneficiary[] = [],
  previousYear?: AnnualDisclosure | null
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

    // تحليل البيانات
    const expensesBreakdown = disclosure.expenses_breakdown as Record<string, number> | null;
    const expenseItems: ExpenseItem[] = expensesBreakdown 
      ? Object.entries(expensesBreakdown)
          .filter(([name]) => name.toLowerCase() !== 'total')
          .map(([name, amount]) => ({ name, amount: amount || 0 }))
          .sort((a, b) => b.amount - a.amount)
      : [];

    const revenueBreakdown = disclosure.revenue_breakdown as Record<string, number> | null;
    const revenueItems: RevenueItem[] = revenueBreakdown
      ? Object.entries(revenueBreakdown)
          .filter(([name]) => name.toLowerCase() !== 'total')
          .map(([name, amount]) => ({ name, amount: amount || 0 }))
          .sort((a, b) => b.amount - a.amount)
      : [];

    const beneficiariesDetails = disclosure.beneficiaries_details as BeneficiariesDetails | null;
    const distributions = beneficiariesDetails?.distributions;

    const totalRevenues = disclosure.total_revenues || 0;
    const totalExpenses = disclosure.total_expenses || 0;
    const netIncome = disclosure.net_income || 0;
    const nazerShare = disclosure.nazer_share || 0;
    const charityShare = disclosure.charity_share || 0;
    const corpusShare = disclosure.corpus_share || 0;
    const vatAmount = disclosure.vat_amount || 0;
    const distributedAmount = distributions?.total || 0;

    // ========= الصفحة الأولى - الملخص =========
    
    // الإطار الرئيسي
    doc.setDrawColor(...WAQF_COLORS.primary);
    doc.setLineWidth(2);
    doc.rect(10, 10, 190, 277);

    // ترويسة الوقف الرسمية
    let yPos = addWaqfHeader(doc, fontName, `الإفصاح السنوي ${disclosure.year - 1}-${disclosure.year}`);
    
    // اسم الوقف
    doc.setFont(fontName, "bold");
    doc.setFontSize(14);
    doc.setTextColor(...WAQF_COLORS.text);
    doc.text(processArabicText(disclosure.waqf_name), 105, yPos, { align: "center" });
    yPos += 12;

    // ========= الملخص المالي الرئيسي =========
    doc.setFont(fontName, "bold");
    doc.setFontSize(13);
    doc.setTextColor(...WAQF_COLORS.text);
    doc.text(processArabicText("ملخص الأرقام الرئيسية"), 190, yPos, { align: "right" });
    yPos += 8;

    const summaryData = processArabicTableData([
      ["إجمالي الإيرادات", formatCurrency(totalRevenues)],
      ["إجمالي المصروفات", formatCurrency(totalExpenses)],
      ["صافي الدخل", formatCurrency(netIncome)],
      ["عدد المستفيدين", disclosure.total_beneficiaries.toString()],
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [processArabicHeaders(["البيان", "القيمة"])],
      body: summaryData,
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

    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 12;

    // ========= التدفق المالي =========
    doc.setFont(fontName, "bold");
    doc.setFontSize(13);
    doc.text(processArabicText("التدفق المالي"), 190, yPos, { align: "right" });
    yPos += 8;

    const flowData = processArabicTableData([
      ["إجمالي الإيرادات", formatCurrency(totalRevenues)],
      ["(-) إجمالي المصروفات", `(${formatCurrency(totalExpenses)})`],
      ["= صافي الدخل", formatCurrency(netIncome)],
      [`(-) نصيب الناظر (${formatPercentage(disclosure.nazer_percentage)})`, `(${formatCurrency(nazerShare)})`],
      [`(-) نصيب الخيرات (${formatPercentage(disclosure.charity_percentage)})`, `(${formatCurrency(charityShare)})`],
      ...(vatAmount > 0 ? [["(-) ضريبة القيمة المضافة", `(${formatCurrency(vatAmount)})`]] : []),
      ["(-) توزيعات الورثة", `(${formatCurrency(distributedAmount)})`],
      ["رقبة الوقف (المتبقي)", formatCurrency(corpusShare)],
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [processArabicHeaders(["البند", "المبلغ"])],
      body: flowData,
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
      didParseCell: (data) => {
        // تلوين الصف الأخير
        if (data.row.index === flowData.length - 1) {
          data.cell.styles.fillColor = [232, 244, 248];
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: 20, right: 20 },
    });

    // ========= صفحة تفصيل الإيرادات =========
    if (revenueItems.length > 0) {
      doc.addPage();
      
      // الإطار
      doc.setDrawColor(...WAQF_COLORS.primary);
      doc.setLineWidth(2);
      doc.rect(10, 10, 190, 277);
      
      yPos = 25;
      
      doc.setFont(fontName, "bold");
      doc.setFontSize(16);
      doc.setTextColor(...WAQF_COLORS.text);
      doc.text(processArabicText("تفصيل الإيرادات"), 105, yPos, { align: "center" });
      yPos += 12;

      const revenueData = processArabicTableData(
        revenueItems.map(item => [
          translateRevenueName(item.name),
          formatCurrency(item.amount),
          formatPercentage(totalRevenues > 0 ? (item.amount / totalRevenues) * 100 : 0)
        ])
      );

      // إضافة صف الإجمالي
      revenueData.push(processArabicHeaders(["الإجمالي", formatCurrency(totalRevenues), "100%"])[0] as unknown as string[]);

      autoTable(doc, {
        startY: yPos,
        head: [processArabicHeaders(["المصدر", "المبلغ", "النسبة"])],
        body: revenueData,
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
        didParseCell: (data) => {
          // تلوين صف الإجمالي
          if (data.row.index === revenueData.length - 1) {
            data.cell.styles.fillColor = [232, 244, 248];
            data.cell.styles.fontStyle = 'bold';
          }
        },
        margin: { left: 20, right: 20 },
      });
    }

    // ========= صفحة تفصيل المصروفات =========
    if (expenseItems.length > 0) {
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

      const expenseData = processArabicTableData(
        expenseItems.map(item => [
          translateExpenseName(item.name),
          formatCurrency(item.amount),
          formatPercentage(totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0)
        ])
      );

      // إضافة صف الإجمالي
      expenseData.push(processArabicHeaders(["الإجمالي", formatCurrency(totalExpenses), "100%"])[0] as unknown as string[]);

      autoTable(doc, {
        startY: yPos,
        head: [processArabicHeaders(["البند", "المبلغ", "النسبة"])],
        body: expenseData,
        theme: 'grid',
        styles: { 
          font: fontName,
          halign: "right",
          fontSize: 11,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [220, 53, 69],
          textColor: WAQF_COLORS.white,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: WAQF_COLORS.alternateRow,
        },
        didParseCell: (data) => {
          // تلوين صف الإجمالي
          if (data.row.index === expenseData.length - 1) {
            data.cell.styles.fillColor = [232, 244, 248];
            data.cell.styles.fontStyle = 'bold';
          }
        },
        margin: { left: 20, right: 20 },
      });
    }

    // ========= صفحة توزيعات المستفيدين =========
    if (distributions || disclosure.sons_count || disclosure.daughters_count || disclosure.wives_count) {
      doc.addPage();
      
      // الإطار
      doc.setDrawColor(...WAQF_COLORS.primary);
      doc.setLineWidth(2);
      doc.rect(10, 10, 190, 277);
      
      yPos = 25;
      
      doc.setFont(fontName, "bold");
      doc.setFontSize(16);
      doc.setTextColor(...WAQF_COLORS.text);
      doc.text(processArabicText("توزيعات المستفيدين"), 105, yPos, { align: "center" });
      yPos += 12;

      // نسب التوزيع
      const distributionData = processArabicTableData([
        ["حصة الناظر", formatCurrency(nazerShare), formatPercentage(disclosure.nazer_percentage)],
        ["صدقة الواقف", formatCurrency(charityShare), formatPercentage(disclosure.charity_percentage)],
        ["رأس مال الوقف", formatCurrency(corpusShare), formatPercentage(disclosure.corpus_percentage)],
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

      yPos = (doc.lastAutoTable?.finalY ?? yPos) + 12;

      // إحصائيات المستفيدين
      doc.setFont(fontName, "bold");
      doc.setFontSize(13);
      doc.text(processArabicText("إحصائيات المستفيدين"), 190, yPos, { align: "right" });
      yPos += 8;

      const sonsCount = distributions?.sons_count ?? disclosure.sons_count ?? 0;
      const daughtersCount = distributions?.daughters_count ?? disclosure.daughters_count ?? 0;
      const wivesCount = distributions?.wives_count ?? disclosure.wives_count ?? 0;

      const beneficiaryStats: string[][] = [];
      if (sonsCount > 0) {
        beneficiaryStats.push([
          "الأبناء",
          sonsCount.toString(),
          distributions?.sons_share ? formatCurrency(distributions.sons_share) : "-"
        ]);
      }
      if (daughtersCount > 0) {
        beneficiaryStats.push([
          "البنات",
          daughtersCount.toString(),
          distributions?.daughters_share ? formatCurrency(distributions.daughters_share) : "-"
        ]);
      }
      if (wivesCount > 0) {
        beneficiaryStats.push([
          "الزوجات",
          wivesCount.toString(),
          distributions?.wives_share ? formatCurrency(distributions.wives_share) : "-"
        ]);
      }

      beneficiaryStats.push([
        "الإجمالي",
        disclosure.total_beneficiaries.toString(),
        distributions?.total ? formatCurrency(distributions.total) : "-"
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [processArabicHeaders(["الفئة", "العدد", "المبلغ"])],
        body: processArabicTableData(beneficiaryStats),
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
        didParseCell: (data) => {
          // تلوين صف الإجمالي
          if (data.row.index === beneficiaryStats.length - 1) {
            data.cell.styles.fillColor = [232, 244, 248];
            data.cell.styles.fontStyle = 'bold';
          }
        },
        margin: { left: 20, right: 20 },
      });
    }

    // ========= صفحة قائمة المستفيدين التفصيلية =========
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

    // ========= صفحة المقارنة مع العام السابق =========
    if (previousYear) {
      doc.addPage();
      
      // الإطار
      doc.setDrawColor(...WAQF_COLORS.primary);
      doc.setLineWidth(2);
      doc.rect(10, 10, 190, 277);
      
      yPos = 25;
      
      doc.setFont(fontName, "bold");
      doc.setFontSize(16);
      doc.setTextColor(...WAQF_COLORS.text);
      doc.text(processArabicText(`المقارنة مع العام السابق (${previousYear.year - 1}-${previousYear.year})`), 105, yPos, { align: "center" });
      yPos += 12;

      const prevRevenues = previousYear.total_revenues || 0;
      const prevExpenses = previousYear.total_expenses || 0;
      const prevNetIncome = previousYear.net_income || 0;

      const revenueChange = totalRevenues - prevRevenues;
      const expenseChange = totalExpenses - prevExpenses;
      const incomeChange = netIncome - prevNetIncome;

      const revenueChangePercent = prevRevenues > 0 ? ((revenueChange) / prevRevenues) * 100 : 0;
      const expenseChangePercent = prevExpenses > 0 ? ((expenseChange) / prevExpenses) * 100 : 0;
      const incomeChangePercent = prevNetIncome > 0 ? ((incomeChange) / prevNetIncome) * 100 : 0;

      const comparisonData = processArabicTableData([
        [
          "إجمالي الإيرادات",
          formatCurrency(totalRevenues),
          formatCurrency(prevRevenues),
          formatCurrency(revenueChange),
          formatPercentage(revenueChangePercent)
        ],
        [
          "إجمالي المصروفات",
          formatCurrency(totalExpenses),
          formatCurrency(prevExpenses),
          formatCurrency(expenseChange),
          formatPercentage(expenseChangePercent)
        ],
        [
          "صافي الدخل",
          formatCurrency(netIncome),
          formatCurrency(prevNetIncome),
          formatCurrency(incomeChange),
          formatPercentage(incomeChangePercent)
        ],
        [
          "عدد المستفيدين",
          disclosure.total_beneficiaries.toString(),
          previousYear.total_beneficiaries.toString(),
          (disclosure.total_beneficiaries - previousYear.total_beneficiaries).toString(),
          "-"
        ],
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [processArabicHeaders(["البند", "العام الحالي", "العام السابق", "التغيير", "النسبة"])],
        body: comparisonData,
        theme: 'grid',
        styles: { 
          font: fontName,
          halign: "right",
          fontSize: 10,
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
        margin: { left: 15, right: 15 },
      });

      yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

      // الرؤى الذكية
      doc.setFont(fontName, "bold");
      doc.setFontSize(13);
      doc.text(processArabicText("الرؤى والتحليلات"), 190, yPos, { align: "right" });
      yPos += 10;

      doc.setFont(fontName, "normal");
      doc.setFontSize(11);

      const insights: string[] = [];
      
      // نسبة المصروفات
      const expenseRatio = totalRevenues > 0 ? (totalExpenses / totalRevenues) * 100 : 0;
      if (expenseRatio < 30) {
        insights.push(`✓ كفاءة عالية: المصروفات تمثل ${formatPercentage(expenseRatio)} فقط من الإيرادات`);
      } else if (expenseRatio > 50) {
        insights.push(`⚠ المصروفات مرتفعة: تمثل ${formatPercentage(expenseRatio)} من الإيرادات`);
      }

      // نمو الإيرادات
      if (revenueChangePercent > 5) {
        insights.push(`✓ نمو الإيرادات: زادت بنسبة ${formatPercentage(revenueChangePercent)}`);
      } else if (revenueChangePercent < -5) {
        insights.push(`⚠ انخفاض الإيرادات: بنسبة ${formatPercentage(Math.abs(revenueChangePercent))}`);
      }

      // ضبط المصروفات
      if (expenseChangePercent < -10) {
        insights.push(`✓ ضبط المصروفات: انخفضت بنسبة ${formatPercentage(Math.abs(expenseChangePercent))}`);
      } else if (expenseChangePercent > 20) {
        insights.push(`⚠ ارتفاع المصروفات: زادت بنسبة ${formatPercentage(expenseChangePercent)}`);
      }

      // صافي الدخل
      if (netIncome > 0) {
        insights.push(`✓ صافي دخل إيجابي: ${formatCurrency(netIncome)}`);
      }

      // عرض الرؤى
      insights.forEach(insight => {
        doc.text(processArabicText(insight), 185, yPos, { align: "right" });
        yPos += 7;
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
    doc.save(`إفصاح-سنوي-${disclosure.year - 1}-${disclosure.year}-${disclosure.waqf_name}.pdf`);
  } catch (error) {
    logger.error(error, { 
      context: 'generate_disclosure_pdf', 
      severity: 'medium'
    });
    throw error;
  }
};
