/**
 * Hook لاختبار نظام السنة المالية
 * @version 2.8.60
 */

import { useState } from "react";
import { toast } from "sonner";
import { FiscalYearService } from "@/services";

interface TestResult {
  test: string;
  status: "success" | "error" | "pending";
  message: string;
}

export function useFiscalYearTests() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    const testResults: TestResult[] = [];

    // Test 1: جدول fiscal_year_closings
    try {
      const fiscalYears = await FiscalYearService.getAll();
      testResults.push({
        test: "جدول السنوات المالية",
        status: "success",
        message: `تم العثور على ${fiscalYears.length} سنة مالية`
      });
    } catch (error) {
      testResults.push({
        test: "جدول السنوات المالية",
        status: "error",
        message: error instanceof Error ? error.message : "فشل الاتصال بالجدول"
      });
    }

    // Test 2: دالة calculate_fiscal_year_summary
    try {
      const fiscalYears = await FiscalYearService.getAll();
      const firstYear = fiscalYears[0];

      if (firstYear) {
        const summary = await FiscalYearService.calculateSummary(firstYear.id);
        testResults.push({
          test: "دالة حساب ملخص السنة",
          status: "success",
          message: `الإيرادات: ${summary.totalRevenues.toLocaleString('ar-SA')} ر.س`
        });
      } else {
        testResults.push({
          test: "دالة حساب ملخص السنة",
          status: "error",
          message: "لا توجد سنوات مالية للاختبار"
        });
      }
    } catch (error) {
      testResults.push({
        test: "دالة حساب ملخص السنة",
        status: "error",
        message: error instanceof Error ? error.message : "فشل تنفيذ الدالة"
      });
    }

    // Test 3: Edge Function
    try {
      const activeFiscalYears = await FiscalYearService.getActiveFiscalYears();
      const activeYear = activeFiscalYears[0];

      if (activeYear) {
        const preview = await FiscalYearService.getClosingPreview(activeYear.id);
        testResults.push({
          test: "Edge Function: auto-close-fiscal-year",
          status: "success",
          message: `المعاينة تعمل: ${preview?.can_close ? 'يمكن الإقفال' : 'لا يمكن الإقفال'}`
        });
      } else {
        testResults.push({
          test: "Edge Function: auto-close-fiscal-year",
          status: "error",
          message: "لا توجد سنوات مفتوحة للاختبار"
        });
      }
    } catch (error) {
      testResults.push({
        test: "Edge Function: auto-close-fiscal-year",
        status: "error",
        message: error instanceof Error ? error.message : "فشل استدعاء Edge Function"
      });
    }

    // Test 4: السنة النشطة
    try {
      const activeYear = await FiscalYearService.getActive();
      
      if (activeYear) {
        testResults.push({
          test: "السنة المالية النشطة",
          status: "success",
          message: `السنة النشطة: ${activeYear.name}`
        });
      } else {
        testResults.push({
          test: "السنة المالية النشطة",
          status: "pending",
          message: "لا توجد سنة نشطة"
        });
      }
    } catch (error) {
      testResults.push({
        test: "السنة المالية النشطة",
        status: "error",
        message: error instanceof Error ? error.message : "فشل جلب السنة النشطة"
      });
    }

    // Test 5: بيانات الإقفال
    try {
      const fiscalYears = await FiscalYearService.getAll();
      const closedYear = fiscalYears.find(fy => fy.is_closed);

      if (closedYear) {
        const closingData = await FiscalYearService.getClosingData(closedYear.id);
        testResults.push({
          test: "بيانات الإقفال",
          status: closingData ? "success" : "pending",
          message: closingData ? "بيانات الإقفال موجودة" : "لا توجد بيانات إقفال"
        });
      } else {
        testResults.push({
          test: "بيانات الإقفال",
          status: "pending",
          message: "لا توجد سنوات مغلقة للاختبار"
        });
      }
    } catch (error) {
      testResults.push({
        test: "بيانات الإقفال",
        status: "error",
        message: "فشل اختبار بيانات الإقفال"
      });
    }

    setResults(testResults);
    setTesting(false);

    const successCount = testResults.filter(r => r.status === "success").length;
    const totalCount = testResults.length;

    if (successCount === totalCount) {
      toast.success(`جميع الاختبارات نجحت! (${successCount}/${totalCount})`);
    } else {
      toast.warning(`نجح ${successCount} من ${totalCount} اختبار`);
    }
  };

  return {
    testing,
    results,
    runTests,
  };
}
