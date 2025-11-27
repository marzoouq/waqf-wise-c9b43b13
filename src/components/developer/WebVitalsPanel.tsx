import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebVitals } from "@/hooks/developer/useWebVitals";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Gauge, Zap, Clock } from "lucide-react";

export function WebVitalsPanel() {
  const { vitals, history } = useWebVitals();

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case "good": return <Badge className="bg-green-500">ممتاز</Badge>;
      case "needs-improvement": return <Badge variant="secondary">يحتاج تحسين</Badge>;
      case "poor": return <Badge variant="destructive">ضعيف</Badge>;
      default: return <Badge variant="outline">غير متاح</Badge>;
    }
  };

  const formatValue = (value: number | null, unit: string = "ms") => {
    if (value === null) return "N/A";
    if (unit === "ms" && value > 1000) return `${(value / 1000).toFixed(2)}s`;
    return `${value.toFixed(0)}${unit}`;
  };

  return (
    <div className="space-y-6">
      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                LCP
              </span>
              {getRatingBadge(vitals.lcp_rating)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatValue(vitals.lcp)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Largest Contentful Paint
            </p>
            <Progress 
              value={vitals.lcp ? Math.min((vitals.lcp / 2500) * 100, 100) : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                FCP
              </span>
              {getRatingBadge(vitals.fcp_rating)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatValue(vitals.fcp)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              First Contentful Paint
            </p>
            <Progress 
              value={vitals.fcp ? Math.min((vitals.fcp / 1800) * 100, 100) : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                CLS
              </span>
              {getRatingBadge(vitals.cls_rating)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatValue(vitals.cls, "")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cumulative Layout Shift
            </p>
            <Progress 
              value={vitals.cls ? Math.min((vitals.cls / 0.1) * 100, 100) : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                TTFB
              </span>
              {getRatingBadge(vitals.ttfb_rating)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatValue(vitals.ttfb)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Time to First Byte
            </p>
            <Progress 
              value={vitals.ttfb ? Math.min((vitals.ttfb / 800) * 100, 100) : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Performance Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الأداء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد بيانات متاحة حالياً
              </p>
            ) : (
              history.slice(-10).map((entry) => (
                <div key={`vital-${entry.timestamp}-${entry.name}`} className="flex items-center justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleTimeString('ar-SA')}
                  </span>
                  <span className="font-medium">{entry.name}</span>
                  <span className="text-primary">{formatValue(entry.value)}</span>
                  {getRatingBadge(entry.rating)}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>توصيات التحسين</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {vitals.lcp && vitals.lcp > 2500 && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-500">⚠️</span>
                <span>قم بتحسين وقت تحميل أكبر عنصر (LCP) عن طريق تحسين الصور واستخدام lazy loading</span>
              </li>
            )}
            {vitals.fcp && vitals.fcp > 1800 && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-500">⚠️</span>
                <span>قم بتحسين وقت رسم المحتوى الأول (FCP) عن طريق تقليل حجم JavaScript</span>
              </li>
            )}
            {vitals.cls && vitals.cls > 0.1 && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-500">⚠️</span>
                <span>قم بتحسين استقرار التخطيط (CLS) عن طريق تحديد أبعاد الصور والإعلانات</span>
              </li>
            )}
            {vitals.ttfb && vitals.ttfb > 800 && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-500">⚠️</span>
                <span>قم بتحسين وقت الاستجابة الأول (TTFB) عن طريق استخدام CDN وتحسين الخادم</span>
              </li>
            )}
            {(!vitals.lcp || vitals.lcp <= 2500) && 
             (!vitals.fcp || vitals.fcp <= 1800) && 
             (!vitals.cls || vitals.cls <= 0.1) && 
             (!vitals.ttfb || vitals.ttfb <= 800) && (
              <li className="flex items-start gap-2 text-green-600">
                <span>✅</span>
                <span>أداء التطبيق ممتاز! جميع المقاييس ضمن الحدود المثالية</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
