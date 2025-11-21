import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Zap, Bell, TrendingUp, Activity, Eye } from "lucide-react";

export function ErrorReportingGuide() {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
          <Shield className="h-5 w-5" />
          نظام الحماية والإشعارات التلقائي
        </CardTitle>
        <CardDescription className="text-green-700 dark:text-green-300">
          نظام متطور للكشف عن الأخطاء قبل وبعد حدوثها
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-white/50 dark:bg-gray-900/50 border-green-300 dark:border-green-700">
          <Zap className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900 dark:text-green-100">
            كشف تلقائي للأخطاء 24/7
          </AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            النظام يراقب جميع العمليات ويكتشف الأخطاء فوراً، حتى قبل أن تؤثر على المستخدمين
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-900/60 rounded-lg">
            <Activity className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
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
            <Eye className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
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
            <Bell className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
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
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
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

        <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-300 dark:border-green-700">
          <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-2">
            🛡️ <strong>مستويات الحماية:</strong>
          </p>
          <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
            <li>• <strong>Error Boundary:</strong> التقاط أخطاء واجهة المستخدم</li>
            <li>• <strong>Global Handler:</strong> التقاط جميع الأخطاء غير المتوقعة</li>
            <li>• <strong>Network Monitor:</strong> مراقبة أخطاء الشبكة والاتصالات</li>
            <li>• <strong>Performance Monitor:</strong> رصد مشاكل الأداء</li>
            <li>• <strong>Health Checks:</strong> فحص صحة النظام الدوري</li>
          </ul>
        </div>

        <div className="pt-2 border-t border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-300">
            <span className="font-semibold">ملاحظة:</span> جميع الأخطاء يتم تسجيلها في قاعدة بيانات آمنة
            مع تفاصيل كاملة (نوع الخطأ، الوقت، الصفحة، المتصفح) لتسهيل المعالجة السريعة.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
