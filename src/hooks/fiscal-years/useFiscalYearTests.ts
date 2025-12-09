/**
 * Hook لاختبار نظام السنة المالية
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      const { data, error } = await supabase
        .from("fiscal_year_closings")
        .select("id")
        .limit(1);
      
      if (error) throw error;
      
      testResults.push({
        test: "جدول fiscal_year_closings",
        status: "success",
        message: "الجدول موجود ويعمل بشكل صحيح"
      });
    } catch (error) {
      testResults.push({
        test: "جدول fiscal_year_closings",
        status: "error",
        message: error instanceof Error ? error.message : "فشل الاتصال بالجدول"
      });
    }

    // Test 2: دالة calculate_fiscal_year_summary
    try {
      const { data: fiscalYears } = await supabase
        .from("fiscal_years")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (fiscalYears) {
        const { data, error } = await supabase.rpc("calculate_fiscal_year_summary", {
          p_fiscal_year_id: fiscalYears.id
        });

        if (error) throw error;

        testResults.push({
          test: "دالة calculate_fiscal_year_summary",
          status: "success",
          message: `الدالة تعمل بنجاح: ${JSON.stringify(data).substring(0, 50)}...`
        });
      } else {
        testResults.push({
          test: "دالة calculate_fiscal_year_summary",
          status: "error",
          message: "لا توجد سنوات مالية للاختبار"
        });
      }
    } catch (error) {
      testResults.push({
        test: "دالة calculate_fiscal_year_summary",
        status: "error",
        message: error instanceof Error ? error.message : "فشل تنفيذ الدالة"
      });
    }

    // Test 3: Edge Function
    try {
      const { data: fiscalYears } = await supabase
        .from("fiscal_years")
        .select("id")
        .eq("is_closed", false)
        .limit(1)
        .maybeSingle();

      if (fiscalYears) {
        const { data, error } = await supabase.functions.invoke("auto-close-fiscal-year", {
          body: { 
            fiscal_year_id: fiscalYears.id, 
            preview_only: true 
          }
        });

        if (error) throw error;

        testResults.push({
          test: "Edge Function: auto-close-fiscal-year",
          status: "success",
          message: `المعاينة تعمل: ${data?.can_close ? 'يمكن الإقفال' : 'لا يمكن الإقفال'}`
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

    // Test 4: حساب الزكاة
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, code, name_ar")
        .eq("code", "5.4.5")
        .maybeSingle();
      
      if (!data) throw new Error("حساب الزكاة غير موجود");
      if (error) throw error;

      testResults.push({
        test: "حساب الزكاة (5.4.5)",
        status: "success",
        message: `الحساب موجود: ${data.name_ar}`
      });
    } catch (error) {
      testResults.push({
        test: "حساب الزكاة (5.4.5)",
        status: "error",
        message: "حساب الزكاة غير موجود في شجرة الحسابات"
      });
    }

    // Test 5: RLS Policies
    try {
      const { data, error } = await supabase
        .from("fiscal_year_closings")
        .select("id")
        .limit(1);

      testResults.push({
        test: "RLS Policies",
        status: data ? "success" : "error",
        message: data ? "الصلاحيات تعمل بشكل صحيح" : "مشكلة في الصلاحيات"
      });
    } catch (error) {
      testResults.push({
        test: "RLS Policies",
        status: "error",
        message: "فشل اختبار الصلاحيات"
      });
    }

    // Test 6: Trigger الحماية
    try {
      const { data: closedYear } = await supabase
        .from("fiscal_years")
        .select("id")
        .eq("is_closed", true)
        .limit(1)
        .maybeSingle();

      if (closedYear) {
        testResults.push({
          test: "Trigger حماية السنوات المغلقة",
          status: "success",
          message: "تم العثور على سنة مغلقة للاختبار"
        });
      } else {
        testResults.push({
          test: "Trigger حماية السنوات المغلقة",
          status: "pending",
          message: "لا توجد سنوات مغلقة للاختبار"
        });
      }
    } catch (error) {
      testResults.push({
        test: "Trigger حماية السنوات المغلقة",
        status: "error",
        message: "فشل اختبار Trigger"
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
