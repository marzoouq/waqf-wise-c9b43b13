import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Zap, Download, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ReportsExplanationCard() {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
          <FileText className="h-5 w-5" />
          كيف تعمل التقارير الشخصية؟
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          نظام تقارير آلي متكامل
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-card/50 border-info">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">
            تقارير تلقائية 100%
          </AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            جميع التقارير الشخصية يتم إنشاؤها تلقائياً من بياناتك المحفوظة في النظام
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-card/60 rounded-lg">
            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-foreground">
                تقرير المدفوعات (PDF)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                يتم جمع جميع مدفوعاتك تلقائياً من قاعدة البيانات وإنشاء ملف PDF منسق احترافياً بضغطة زر واحدة
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-card/60 rounded-lg">
            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-foreground">
                كشف الحساب (PDF)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ملخص شامل لحسابك يشمل: اسمك، رقمك الوطني، إجمالي المدفوعات، وجدول تفصيلي لكل العمليات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
            <Download className="h-4 w-4 text-blue-700 dark:text-blue-300" />
            <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
              اضغط على أي زر تقرير وسيتم التحميل فوراً - لا حاجة لانتظار!
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <span className="font-semibold">ملاحظة:</span> جميع التقارير يتم إنشاؤها باستخدام مكتبات 
            {" "}<code className="bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded text-blue-900 dark:text-blue-100">jsPDF</code>{" "}
            و <code className="bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded text-blue-900 dark:text-blue-100">xlsx</code>{" "}
            لضمان تنسيق احترافي وسهولة الطباعة.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
