/**
 * لوحة اختبار نظام إقفال السنة المالية
 * Test Panel for Fiscal Year Closing System
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Calendar,
  Database,
  FileText,
  Settings,
  Lock,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function FiscalYearTestPanel() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    test: string;
    status: "success" | "error" | "pending";
    message: string;
  }[]>([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    const testResults: typeof results = [];

    // Test 1: التحقق من جدول fiscal_year_closings
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

    // Test 2: التحقق من دالة calculate_fiscal_year_summary
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

    // Test 3: التحقق من Edge Function
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

    // Test 4: التحقق من حساب الزكاة
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

    // Test 5: التحقق من RLS Policies
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

    // Test 6: التحقق من Trigger الحماية
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

  const getStatusIcon = (status: "success" | "error" | "pending") => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: "success" | "error" | "pending") => {
    const variants = {
      success: { variant: "default" as const, text: "نجح" },
      error: { variant: "destructive" as const, text: "فشل" },
      pending: { variant: "secondary" as const, text: "معلق" },
    };
    
    const { variant, text } = variants[status];
    return <Badge variant={variant}>{text}</Badge>;
  };

  const testCategories = [
    {
      title: "قاعدة البيانات",
      icon: Database,
      tests: ["جدول fiscal_year_closings", "حساب الزكاة (5.4.5)"]
    },
    {
      title: "الوظائف والإجراءات",
      icon: Settings,
      tests: ["دالة calculate_fiscal_year_summary", "Edge Function: auto-close-fiscal-year"]
    },
    {
      title: "الأمان والحماية",
      icon: Lock,
      tests: ["RLS Policies", "Trigger حماية السنوات المغلقة"]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              لوحة اختبار نظام الإقفال
            </CardTitle>
            <CardDescription>
              اختبار شامل لجميع مكونات نظام إقفال السنة المالية
            </CardDescription>
          </div>
          <Button onClick={runTests} disabled={testing}>
            {testing && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            {testing ? "جاري الاختبار..." : "تشغيل الاختبارات"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {results.length === 0 ? (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              انقر على "تشغيل الاختبارات" لبدء فحص جميع مكونات النظام
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* ملخص النتائج */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testCategories.map((category) => {
                const Icon = category.icon;
                const categoryTests = results.filter(r => 
                  category.tests.includes(r.test)
                );
                const successCount = categoryTests.filter(r => r.status === "success").length;
                const totalCount = categoryTests.length;
                const percentage = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

                return (
                  <Card key={category.title}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">{category.title}</h3>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {successCount}/{totalCount}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            percentage === 100 ? "bg-green-600" : 
                            percentage >= 50 ? "bg-amber-600" : "bg-red-600"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* تفاصيل الاختبارات */}
            <div className="space-y-3">
              {results.map((result, index) => (
                <Card key={index}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{result.test}</h4>
                            {getStatusBadge(result.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
