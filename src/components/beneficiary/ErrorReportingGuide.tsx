import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Zap, Bell, TrendingUp, Activity, Eye, Lightbulb } from "lucide-react";

export function ErrorReportingGuide() {
  return (
    <Card className="bg-gradient-to-br from-success-light to-success-light/50 border-success">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-success-foreground">
          <Lightbulb className="h-5 w-5" />
          دليل الإبلاغ عن الأخطاء
        </CardTitle>
        <CardDescription className="text-success-foreground/80">
          نظام متطور للكشف عن الأخطاء قبل وبعد حدوثها
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-card/50 border-success">
          <Zap className="h-4 w-4 text-success" />
          <AlertTitle className="text-success-foreground">
            الإبلاغ الفعّال يُساعدنا على تحسين الخدمة
          </AlertTitle>
          <AlertDescription className="text-success-foreground/80">
            النظام يراقب جميع العمليات ويكتشف الأخطاء فوراً، حتى قبل أن تؤثر على المستخدمين
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-900/60 rounded-lg">
            <Activity className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                مراقبة الأداء المستمرة
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                يتم رصد أي بطء في النظام أو استهلاك غير طبيعي للموارد تلقائياً
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-900/60 rounded-lg">
            <Eye className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                فحص صحة النظام الدوري
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                يتم فحص جميع الخدمات كل 5 دقائق للتأكد من سلامة عملها
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-900/60 rounded-lg">
            <Bell className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                إشعارات فورية للدعم الفني
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                عند حدوث خطأ، يتم إشعار فريق الدعم فوراً مع تفاصيل كاملة
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-900/60 rounded-lg">
            <TrendingUp className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                تحليل الأخطاء المتكررة
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                يتم رصد الأخطاء المتكررة تلقائياً ورفع أولويتها للمعالجة
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-gradient-to-r from-success-light to-success-light/50 rounded-lg border border-success">
          <p className="text-xs font-medium text-success-foreground mb-2">
            📋 أمثلة على إبلاغات فعالة:
          </p>
          <ul className="text-xs text-success-foreground/80 space-y-1">
            <li>• <strong>Error Boundary:</strong> التقاط أخطاء واجهة المستخدم</li>
            <li>• <strong>Global Handler:</strong> التقاط جميع الأخطاء غير المتوقعة</li>
            <li>• <strong>Network Monitor:</strong> مراقبة أخطاء الشبكة والاتصالات</li>
            <li>• <strong>Performance Monitor:</strong> رصد مشاكل الأداء</li>
            <li>• <strong>Health Checks:</strong> فحص صحة النظام الدوري</li>
          </ul>
        </div>

        <div className="pt-2 border-t border-success">
          <p className="text-xs text-success-foreground/80">
            <span className="font-semibold">ملاحظة:</span> جميع الأخطاء يتم تسجيلها في قاعدة بيانات آمنة
            مع تفاصيل كاملة (نوع الخطأ، الوقت، الصفحة، المتصفح) لتسهيل المعالجة السريعة.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
