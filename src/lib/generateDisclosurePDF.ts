import { AnnualDisclosure } from "@/hooks/reports/useAnnualDisclosures";
import { logger } from "@/lib/logger";
import { Database } from "@/integrations/supabase/types";
import { loadAmiriFonts } from "./fonts/loadArabicFonts";

type DisclosureBeneficiary = Database['public']['Tables']['disclosure_beneficiaries']['Row'];

type JsPDF = import('jspdf').jsPDF;

// Type Augmentation for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
  }
}

const loadArabicFont = async (doc: JsPDF) => {
  try {
    const { regular: amiriRegular, bold: amiriBold } = await loadAmiriFonts();
    
    // التحقق من صحة البيانات
    if (!amiriRegular || amiriRegular.length < 1000) {
      throw new Error('Font data is invalid or too small');
    }
    
    doc.addFileToVFS("Amiri-Regular.ttf", amiriRegular);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    
    doc.addFileToVFS("Amiri-Bold.ttf", amiriBold);
    doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
    
    doc.setFont("Amiri", "normal");
    
    logger.info('Arabic font loaded successfully', { 
      context: 'load_arabic_font_disclosure',
      metadata: { fontSize: amiriRegular.length }
    });
    
    return true;
  } catch (error) {
    logger.error(error, { 
      context: 'load_arabic_font_disclosure', 
      severity: 'high'
    });
    return false;
  }
};

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
    const hasArabicFont = await loadArabicFont(doc);
    const fontName = hasArabicFont ? "Amiri" : "helvetica";
    
    // RTL support
    doc.setR2L(true);
    doc.setLanguage("ar");

    let yPos = 20;

    // الإطار الرئيسي
    doc.setDrawColor(66, 139, 202);
    doc.setLineWidth(2);
    doc.rect(10, 10, 190, 277);

    // العنوان الرئيسي
    doc.setFont(fontName, "bold");
    doc.setFontSize(22);
    doc.setTextColor(33, 37, 41);
    doc.text(`الإفصاح السنوي`, 105, yPos, { align: "center" });
    
    yPos += 10;
    doc.setFontSize(18);
    doc.setTextColor(66, 139, 202);
    doc.text(`${disclosure.year}`, 105, yPos, { align: "center" });
    
    yPos += 8;
    doc.setFontSize(14);
    doc.setTextColor(108, 117, 125);
    doc.text(disclosure.waqf_name, 105, yPos, { align: "center" });
    
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
    doc.text("الملخص المالي السنوي", 190, yPos, { align: "right" });
    yPos += 8;

    const financialData = [
      ["إجمالي الإيرادات", `${disclosure.total_revenues.toLocaleString()} ر.س`],
      ["إجمالي المصروفات", `${disclosure.total_expenses.toLocaleString()} ر.س`],
      ["صافي الدخل", `${disclosure.net_income.toLocaleString()} ر.س`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["البيان", "المبلغ"]],
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
    doc.text("نسب وحصص التوزيع", 190, yPos, { align: "right" });
    yPos += 8;

    const distributionData = [
      ["حصة الناظر", `${disclosure.nazer_share.toLocaleString()} ر.س`, `${disclosure.nazer_percentage}%`],
      ["صدقة الواقف", `${disclosure.charity_share.toLocaleString()} ر.س`, `${disclosure.charity_percentage}%`],
      ["رأس مال الوقف", `${disclosure.corpus_share.toLocaleString()} ر.س`, `${disclosure.corpus_percentage}%`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["النوع", "المبلغ", "النسبة"]],
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
    doc.text("إحصائيات المستفيدين", 190, yPos, { align: "right" });
    yPos += 8;

    const beneficiaryStats = [
      ["عدد الأبناء", disclosure.sons_count.toString()],
      ["عدد البنات", disclosure.daughters_count.toString()],
      ["عدد الزوجات", disclosure.wives_count.toString()],
      ["الإجمالي", disclosure.total_beneficiaries.toString()],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["الفئة", "العدد"]],
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
      doc.text("قائمة المستفيدين وحصصهم", 105, yPos, { align: "center" });
      yPos += 12;

      const beneficiariesData = beneficiaries.map(b => [
        b.beneficiary_name,
        b.beneficiary_type || "-",
        b.relationship || "-",
        `${b.allocated_amount.toLocaleString()} ر.س`,
        b.payments_count.toString(),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["الاسم", "النوع", "القرابة", "المبلغ المخصص", "عدد الدفعات"]],
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
      doc.text("تفصيل المصروفات", 105, yPos, { align: "center" });
      yPos += 12;

      const expensesData: string[][] = [];
      if (disclosure.maintenance_expenses) {
        expensesData.push(["مصروفات الصيانة", `${disclosure.maintenance_expenses.toLocaleString()} ر.س`]);
      }
      if (disclosure.administrative_expenses) {
        expensesData.push(["مصروفات إدارية", `${disclosure.administrative_expenses.toLocaleString()} ر.س`]);
      }
      if (disclosure.development_expenses) {
        expensesData.push(["مصروفات التطوير", `${disclosure.development_expenses.toLocaleString()} ر.س`]);
      }
      if (disclosure.other_expenses) {
        expensesData.push(["مصروفات أخرى", `${disclosure.other_expenses.toLocaleString()} ر.س`]);
      }

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
    doc.save(`إفصاح-سنوي-${disclosure.year}-${disclosure.waqf_name}.pdf`);
  } catch (error) {
    logger.error(error, { 
      context: 'generate_disclosure_pdf', 
      severity: 'medium'
    });
    throw error;
  }
};
