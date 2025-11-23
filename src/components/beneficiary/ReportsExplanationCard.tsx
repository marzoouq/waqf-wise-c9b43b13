import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Zap, Download, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ReportsExplanationCard() {
  return (
    <Card className="bg-gradient-to-br from-info-light/30 to-primary/10 dark:from-info/10 dark:to-primary/5 border-info/30 dark:border-info/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-info dark:text-info-foreground">
          <FileText className="h-5 w-5" />
          كيف تعمل التقارير الشخصية؟
        </CardTitle>
        <CardDescription className="text-info dark:text-info-foreground/80">
          نظام تقارير آلي متكامل
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-card/50 border-info">
          <Zap className="h-4 w-4 text-info" />
          <AlertTitle className="text-info dark:text-info-foreground">
            تقارير تلقائية 100%
          </AlertTitle>
          <AlertDescription className="text-info/90 dark:text-info-foreground/90">
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

          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-info-light/50 to-primary/20 dark:from-info/20 dark:to-primary/10 rounded-lg border border-info/30 dark:border-info/20">
            <Download className="h-4 w-4 text-info" />
            <p className="text-xs font-medium text-info dark:text-info-foreground">
              اضغط على أي زر تقرير وسيتم التحميل فوراً - لا حاجة لانتظار!
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-info/30 dark:border-info/20">
          <p className="text-xs text-info dark:text-info-foreground/80">
            💡 <strong>ملاحظة:</strong> يستخدم النظام مكتبات محلية لتوليد التقارير
            {" "}<code className="bg-info-light/50 dark:bg-info/20 px-1.5 py-0.5 rounded text-info dark:text-info-foreground">jsPDF</code>{" "}
            و <code className="bg-info-light/50 dark:bg-info/20 px-1.5 py-0.5 rounded text-info dark:text-info-foreground">xlsx</code>{" "}
            لضمان تنسيق احترافي وسهولة الطباعة.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
