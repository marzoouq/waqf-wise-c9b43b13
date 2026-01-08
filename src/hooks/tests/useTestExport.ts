/**
 * Hook لتصدير نتائج الاختبارات كـ PDF/Excel
 */

import { useCallback } from 'react';
import { toastSuccess, toastError } from '@/hooks/ui/use-toast';

export interface TestResult {
  testId: string;
  testName: string;
  category: string;
  success: boolean;
  duration: number;
  message?: string;
  timestamp: Date;
}

interface TestCategory {
  id: string;
  label: string;
}

export function useTestExport() {
  // تصدير PDF مفصل
  const exportToPDF = useCallback(async (
    results: TestResult[],
    categories: TestCategory[],
    title: string = 'تقرير الاختبارات الشاملة'
  ) => {
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF('p', 'mm', 'a4');
      
      // تحميل الخط العربي
      const fontResponse = await fetch('/fonts/Cairo-Regular.ttf');
      if (fontResponse.ok) {
        const fontBuffer = await fontResponse.arrayBuffer();
        const fontBase64 = btoa(
          new Uint8Array(fontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        doc.addFileToVFS('Cairo-Regular.ttf', fontBase64);
        doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
        doc.setFont('Cairo');
      }

      const pageWidth = doc.internal.pageSize.getWidth();
      const passed = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const passRate = results.length > 0 ? ((passed / results.length) * 100).toFixed(1) : '0';
      const avgDuration = results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)
        : 0;

      // العنوان
      doc.setFontSize(20);
      doc.text(title, pageWidth / 2, 20, { align: 'center' });

      // التاريخ
      doc.setFontSize(10);
      doc.text(new Date().toLocaleString('ar-SA'), pageWidth / 2, 28, { align: 'center' });

      // ملخص
      doc.setFontSize(14);
      doc.text('ملخص النتائج', pageWidth - 15, 45, { align: 'right' });

      doc.setFontSize(11);
      const summaryY = 55;
      doc.text(`إجمالي الاختبارات: ${results.length}`, pageWidth - 15, summaryY, { align: 'right' });
      doc.text(`ناجح: ${passed} | فاشل: ${failed}`, pageWidth - 15, summaryY + 7, { align: 'right' });
      doc.text(`نسبة النجاح: ${passRate}%`, pageWidth - 15, summaryY + 14, { align: 'right' });
      doc.text(`متوسط الزمن: ${avgDuration}ms`, pageWidth - 15, summaryY + 21, { align: 'right' });

      // جدول النتائج
      const tableData = results.map(r => [
        r.duration + 'ms',
        r.message?.substring(0, 40) || '-',
        r.success ? '✓ نجح' : '✗ فشل',
        categories.find(c => c.id === r.category)?.label || r.category,
        r.testName
      ]);

      (doc as any).autoTable({
        head: [['الزمن', 'الرسالة', 'الحالة', 'الفئة', 'الاختبار']],
        body: tableData,
        startY: 85,
        styles: {
          font: 'Cairo',
          halign: 'right',
          fontSize: 8,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          halign: 'right',
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 50 },
          2: { cellWidth: 20 },
          3: { cellWidth: 30 },
          4: { cellWidth: 60 },
        },
      });

      // التوصيات إذا كانت هناك اختبارات فاشلة
      const failedTests = results.filter(r => !r.success);
      if (failedTests.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('التوصيات والإجراءات المطلوبة', pageWidth - 15, 20, { align: 'right' });

        doc.setFontSize(10);
        let y = 35;
        failedTests.slice(0, 20).forEach((test, index) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(`${index + 1}. ${test.testName}`, pageWidth - 15, y, { align: 'right' });
          doc.text(`   المشكلة: ${test.message || 'غير محدد'}`, pageWidth - 20, y + 6, { align: 'right' });
          y += 15;
        });
      }

      // التذييل
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `صفحة ${i} من ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`test-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toastSuccess('تم تصدير التقرير بنجاح');
    } catch (error: any) {
      console.error('Export PDF error:', error);
      toastError('فشل التصدير: ' + error.message);
    }
  }, []);

  // تصدير Excel
  const exportToExcel = useCallback(async (
    results: TestResult[],
    categories: TestCategory[],
    filename: string = 'test-results'
  ) => {
    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();

      // ورقة الملخص
      const summarySheet = workbook.addWorksheet('ملخص');
      const passed = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      summarySheet.columns = [
        { header: 'البند', key: 'item', width: 30 },
        { header: 'القيمة', key: 'value', width: 20 },
      ];

      summarySheet.addRows([
        { item: 'تاريخ التقرير', value: new Date().toLocaleString('ar-SA') },
        { item: 'إجمالي الاختبارات', value: results.length },
        { item: 'الاختبارات الناجحة', value: passed },
        { item: 'الاختبارات الفاشلة', value: failed },
        { item: 'نسبة النجاح', value: `${((passed / results.length) * 100).toFixed(1)}%` },
        { item: 'متوسط الزمن', value: `${Math.round(results.reduce((s, r) => s + r.duration, 0) / results.length)}ms` },
      ]);

      // تنسيق العناوين
      summarySheet.getRow(1).font = { bold: true };
      summarySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3B82F6' },
      };

      // ورقة النتائج التفصيلية
      const resultsSheet = workbook.addWorksheet('النتائج');
      resultsSheet.columns = [
        { header: 'الاختبار', key: 'name', width: 40 },
        { header: 'الفئة', key: 'category', width: 20 },
        { header: 'الحالة', key: 'status', width: 12 },
        { header: 'الزمن (ms)', key: 'duration', width: 12 },
        { header: 'الرسالة', key: 'message', width: 50 },
        { header: 'التوقيت', key: 'timestamp', width: 20 },
      ];

      results.forEach(r => {
        const row = resultsSheet.addRow({
          name: r.testName,
          category: categories.find(c => c.id === r.category)?.label || r.category,
          status: r.success ? 'نجح' : 'فشل',
          duration: r.duration,
          message: r.message || '-',
          timestamp: r.timestamp.toLocaleString('ar-SA'),
        });

        // تلوين حسب الحالة
        row.getCell('status').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: r.success ? '10B981' : 'EF4444' },
        };
        row.getCell('status').font = { color: { argb: 'FFFFFF' } };
      });

      resultsSheet.getRow(1).font = { bold: true };
      resultsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3B82F6' },
      };

      // ورقة الفئات
      const categoriesSheet = workbook.addWorksheet('حسب الفئة');
      categoriesSheet.columns = [
        { header: 'الفئة', key: 'category', width: 30 },
        { header: 'الإجمالي', key: 'total', width: 12 },
        { header: 'نجح', key: 'passed', width: 12 },
        { header: 'فشل', key: 'failed', width: 12 },
        { header: 'نسبة النجاح', key: 'rate', width: 15 },
      ];

      categories.forEach(cat => {
        const catResults = results.filter(r => r.category === cat.id);
        if (catResults.length === 0) return;

        const catPassed = catResults.filter(r => r.success).length;
        const catFailed = catResults.filter(r => !r.success).length;

        categoriesSheet.addRow({
          category: cat.label,
          total: catResults.length,
          passed: catPassed,
          failed: catFailed,
          rate: `${((catPassed / catResults.length) * 100).toFixed(1)}%`,
        });
      });

      categoriesSheet.getRow(1).font = { bold: true };
      categoriesSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3B82F6' },
      };

      // تحميل الملف
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      toastSuccess('تم تصدير Excel بنجاح');
    } catch (error: any) {
      console.error('Export Excel error:', error);
      toastError('فشل التصدير: ' + error.message);
    }
  }, []);

  return {
    exportToPDF,
    exportToExcel,
  };
}
