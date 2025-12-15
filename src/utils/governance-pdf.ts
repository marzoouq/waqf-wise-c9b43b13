/**
 * توليد PDF للائحة التنفيذية
 * Governance Regulations PDF Generator
 * 
 * @version 2.9.7 - تحسين الأداء بالتحميل الديناميكي
 */

import { regulationsParts } from '@/components/governance/regulations-data';

export async function generateGovernancePDF(): Promise<void> {
  // Dynamic import for jsPDF - لتجنب تحميل المكتبة في الصفحة الرئيسية
  const { default: jsPDF } = await import('jspdf');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // إعداد الخط العربي
  pdf.setFont('helvetica');
  pdf.setR2L(true);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // العنوان الرئيسي
  pdf.setFontSize(18);
  pdf.setTextColor(139, 0, 0); // أحمر داكن
  const title = 'اللائحة التنفيذية لوقف مرزوق علي الثبيتي';
  pdf.text(title, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 12;

  // العنوان الفرعي
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  const subtitle = 'الدليل الإرشادي والحوكمة';
  pdf.text(subtitle, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 10;

  // خط فاصل
  pdf.setDrawColor(139, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // معلومات الوقف
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  const waqfInfo = [
    'تاريخ الإنشاء: 5/5/1441هـ',
    'تاريخ التأسيس: 30/03/1445هـ',
    'تاريخ التنفيذ: 30/6/1446هـ',
  ];
  waqfInfo.forEach(info => {
    pdf.text(info, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 6;
  });
  yPosition += 8;

  // القيم الأساسية
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('القيم الأساسية: الأمانة - النزاهة - الشفافية - العدالة', pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 12;

  // محتوى اللائحة
  for (const part of regulationsParts) {
    // التحقق من المساحة المتبقية
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    // عنوان الجزء
    pdf.setFontSize(12);
    pdf.setTextColor(139, 0, 0);
    pdf.text(part.title, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 8;

    for (const chapter of part.chapters) {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      // عنوان الفصل
      pdf.setFontSize(11);
      pdf.setTextColor(0, 100, 0);
      pdf.text(chapter.title, pageWidth - margin - 5, yPosition, { align: 'right' });
      yPosition += 6;

      for (const section of chapter.content) {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }

        // العنوان الفرعي
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`• ${section.subtitle}`, pageWidth - margin - 10, yPosition, { align: 'right' });
        yPosition += 5;

        // العناصر
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        for (const item of section.items) {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = margin;
          }

          // تقسيم النص الطويل
          const lines = pdf.splitTextToSize(`  - ${item}`, contentWidth - 20);
          for (const line of lines) {
            pdf.text(line, pageWidth - margin - 15, yPosition, { align: 'right' });
            yPosition += 4;
          }
        }
        yPosition += 3;
      }
      yPosition += 3;
    }
    yPosition += 5;
  }

  // تذييل
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `صفحة ${i} من ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // تحميل الملف
  pdf.save('اللائحة_التنفيذية_لوقف_مرزوق_الثبيتي.pdf');
}
