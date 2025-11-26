import { AnnualDisclosure } from "@/hooks/useAnnualDisclosures";
import { logger } from "@/lib/logger";
import { Database } from "@/integrations/supabase/types";
import { withAutoTable } from "@/types/pdf";

type DisclosureBeneficiary = Database['public']['Tables']['disclosure_beneficiaries']['Row'];

// Dynamic import type
type JsPDF = any;

// Load Arabic font
const loadArabicFont = async (doc: JsPDF) => {
  try {
    const response = await fetch('/fonts/amiri.zip');
    if (response.ok) {
      const blob = await response.blob();
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          doc.addFileToVFS('Amiri-Regular.ttf', base64);
          doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
          doc.setFont('Amiri');
          resolve(true);
        };
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    logger.error(error, { 
      context: 'load_arabic_font_pdf', 
      severity: 'low'
    });
  }
};

export const generateDisclosurePDF = async (
  disclosure: AnnualDisclosure,
  beneficiaries: DisclosureBeneficiary[] = []
) => {
  const [jsPDFModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  
  const jsPDF = jsPDFModule.default;
  const baseDoc = new jsPDF();
  const doc = withAutoTable(baseDoc);
  
  await loadArabicFont(baseDoc);
  
  // RTL support
  doc.setR2L(true);
  doc.setLanguage("ar");

  let yPos = 20;

  // العنوان الرئيسي
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(`الإفصاح السنوي - ${disclosure.year}`, 105, yPos, { align: "center" });
  
  yPos += 10;
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(disclosure.waqf_name, 105, yPos, { align: "center" });
  
  yPos += 15;

  // المعلومات المالية
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("الملخص المالي السنوي", 200, yPos, { align: "right" });
  yPos += 7;

  const financialData = [
    ["إجمالي الإيرادات", `${disclosure.total_revenues.toLocaleString()} ر.س`],
    ["إجمالي المصروفات", `${disclosure.total_expenses.toLocaleString()} ر.س`],
    ["صافي الدخل", `${disclosure.net_income.toLocaleString()} ر.س`],
  ];

  doc.autoTable({
    startY: yPos,
    head: [["البيان", "المبلغ"]],
    body: financialData,
    styles: { 
      font: "Amiri",
      halign: "right",
      fontSize: 10,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
    },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // نسب التوزيع
  doc.text("نسب وحصص التوزيع", 200, yPos, { align: "right" });
  yPos += 7;

  const distributionData = [
    ["حصة الناظر", `${disclosure.nazer_share.toLocaleString()} ر.س`, `${disclosure.nazer_percentage}%`],
    ["صدقة الواقف", `${disclosure.charity_share.toLocaleString()} ر.س`, `${disclosure.charity_percentage}%`],
    ["رأس مال الوقف", `${disclosure.corpus_share.toLocaleString()} ر.س`, `${disclosure.corpus_percentage}%`],
  ];

  doc.autoTable({
    startY: yPos,
    head: [["النوع", "المبلغ", "النسبة"]],
    body: distributionData,
    styles: { 
      font: "Amiri",
      halign: "right",
      fontSize: 10,
    },
    headStyles: {
      fillColor: [92, 184, 92],
      textColor: 255,
    },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // إحصائيات المستفيدين
  doc.text("إحصائيات المستفيدين", 200, yPos, { align: "right" });
  yPos += 7;

  const beneficiaryStats = [
    ["عدد الأبناء", disclosure.sons_count.toString()],
    ["عدد البنات", disclosure.daughters_count.toString()],
    ["عدد الزوجات", disclosure.wives_count.toString()],
    ["الإجمالي", disclosure.total_beneficiaries.toString()],
  ];

  doc.autoTable({
    startY: yPos,
    head: [["الفئة", "العدد"]],
    body: beneficiaryStats,
    styles: { 
      font: "Amiri",
      halign: "right",
      fontSize: 10,
    },
    headStyles: {
      fillColor: [240, 173, 78],
      textColor: 255,
    },
  });

  // صفحة جديدة للمستفيدين إذا كانوا موجودين
  if (beneficiaries.length > 0) {
    baseDoc.addPage();
    yPos = 20;
    
    baseDoc.setFontSize(14);
    baseDoc.text("قائمة المستفيدين وحصصهم", 200, yPos, { align: "right" });
    yPos += 7;

    const beneficiariesData = beneficiaries.map(b => [
      b.beneficiary_name,
      b.beneficiary_type || "-",
      b.relationship || "-",
      `${b.allocated_amount.toLocaleString()} ر.س`,
      b.payments_count.toString(),
    ]);

    doc.autoTable({
      startY: yPos,
      head: [["الاسم", "النوع", "القرابة", "المبلغ المخصص", "عدد الدفعات"]],
      body: beneficiariesData,
      styles: { 
        font: "Amiri",
        halign: "right",
        fontSize: 9,
      },
      headStyles: {
        fillColor: [217, 83, 79],
        textColor: 255,
      },
    });
  }

  // المصروفات التفصيلية
  if (disclosure.maintenance_expenses || disclosure.administrative_expenses || 
      disclosure.development_expenses || disclosure.other_expenses) {
    baseDoc.addPage();
    yPos = 20;
    
    baseDoc.setFontSize(14);
    baseDoc.text("تفصيل المصروفات", 200, yPos, { align: "right" });
    yPos += 7;

    const expensesData = [];
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
        fillColor: [91, 192, 222],
        textColor: 255,
      },
    });
  }

  // التذييل
  const pageCount = baseDoc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    baseDoc.setPage(i);
    baseDoc.setFontSize(8);
    baseDoc.setTextColor(150, 150, 150);
    baseDoc.text(
      `تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')}`,
      105,
      285,
      { align: "center" }
    );
    baseDoc.text(
      `صفحة ${i} من ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }

  // حفظ الملف
  baseDoc.save(`إفصاح-سنوي-${disclosure.year}-${disclosure.waqf_name}.pdf`);
};
