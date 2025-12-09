/**
 * لوحة اختبار نظام إقفال السنة المالية
 * Test Panel for Fiscal Year Closing System
 */

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
  Settings,
  Lock,
  TrendingUp
} from "lucide-react";
import { useFiscalYearTests } from "@/hooks/fiscal-years/useFiscalYearTests";

export function FiscalYearTestPanel() {
  const { testing, results, runTests } = useFiscalYearTests();

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
