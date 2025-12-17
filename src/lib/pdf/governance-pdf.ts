/**
 * توليد PDF للائحة التنفيذية
 * Governance Regulations PDF Generator
 * 
 * @version 2.9.42 - إصلاح الخط العربي
 */

import { regulationsParts } from '@/components/governance/regulations-data';
import { loadArabicFontToPDF, addWaqfHeader, addWaqfFooter, WAQF_COLORS } from './arabic-pdf-utils';

export async function generateGovernancePDF(): Promise<void> {
  // Dynamic import for jsPDF
  const { default: jsPDF } = await import('jspdf');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // تحميل الخط العربي
  const fontName = await loadArabicFontToPDF(pdf);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // إضافة ترويسة الوقف
  let yPosition = addWaqfHeader(pdf, fontName, 'اللائحة التنفيذية لوقف مرزوق علي الثبيتي');
  yPosition += 5;

  // معلومات الوقف
  pdf.setFontSize(10);
  pdf.setTextColor(...WAQF_COLORS.text);
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
      addWaqfFooter(pdf, fontName);
      pdf.addPage();
      yPosition = margin;
    }

    // عنوان الجزء
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(...WAQF_COLORS.primary);
    pdf.text(part.title, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 8;

    for (const chapter of part.chapters) {
      if (yPosition > pageHeight - 40) {
        addWaqfFooter(pdf, fontName);
        pdf.addPage();
        yPosition = margin;
      }

      // عنوان الفصل
      pdf.setFont(fontName, 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(...WAQF_COLORS.secondary);
      pdf.text(chapter.title, pageWidth - margin - 5, yPosition, { align: 'right' });
      yPosition += 6;

      for (const section of chapter.content) {
        if (yPosition > pageHeight - 30) {
          addWaqfFooter(pdf, fontName);
          pdf.addPage();
          yPosition = margin;
        }

        // العنوان الفرعي
        pdf.setFont(fontName, 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`• ${section.subtitle}`, pageWidth - margin - 10, yPosition, { align: 'right' });
        yPosition += 5;

        // العناصر
        pdf.setFont(fontName, 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(...WAQF_COLORS.muted);
        for (const item of section.items) {
          if (yPosition > pageHeight - 20) {
            addWaqfFooter(pdf, fontName);
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

  // تذييل لجميع الصفحات
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addWaqfFooter(pdf, fontName);
    
    // رقم الصفحة
    pdf.setFont(fontName, 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...WAQF_COLORS.muted);
    pdf.text(
      `صفحة ${i} من ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // تحميل الملف
  pdf.save('اللائحة_التنفيذية_لوقف_مرزوق_الثبيتي.pdf');
}
