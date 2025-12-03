import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Gauge, Zap, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { onLCP, onFCP, onCLS, onINP, onTTFB } from 'web-vitals';

interface VitalsData {
  lcp: number | null;
  fcp: number | null;
  cls: number | null;
  inp: number | null;
  ttfb: number | null;
  lcp_rating: string;
  fcp_rating: string;
  cls_rating: string;
  inp_rating: string;
  ttfb_rating: string;
}

interface VitalEntry {
  name: string;
  value: number;
  rating: string;
  timestamp: number;
}

export function WebVitalsPanel() {
  const [vitals, setVitals] = useState<VitalsData>({
    lcp: null,
    fcp: null,
    cls: null,
    inp: null,
    ttfb: null,
    lcp_rating: 'good',
    fcp_rating: 'good',
    cls_rating: 'good',
    inp_rating: 'good',
    ttfb_rating: 'good',
  });
  const [history, setHistory] = useState<VitalEntry[]>([]);

  useEffect(() => {
    const handleMetric = (metric: { name: string; value: number; rating: string }) => {
      setVitals((prev) => ({
        ...prev,
        [metric.name.toLowerCase()]: metric.value,
        [`${metric.name.toLowerCase()}_rating`]: metric.rating,
      }));

      setHistory((prev) => [
        ...prev,
        {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          timestamp: Date.now(),
        },
      ]);
    };

    onLCP(handleMetric);
    onFCP(handleMetric);
    onCLS(handleMetric);
    onINP(handleMetric);
    onTTFB(handleMetric);
  }, []);

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
              history.slice(-10).map((entry, index) => (
                <div key={`vital-${entry.timestamp}-${index}`} className="flex items-center justify-between text-sm border-b pb-2">
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

      {/* Dynamic Recommendations based on current metrics */}
      <Card>
        <CardHeader>
          <CardTitle>توصيات التحسين للصفحة الحالية</CardTitle>
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
                <span>أداء الصفحة الحالية ممتاز!</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* General Best Practices - Always Shown */}
      <Card>
        <CardHeader>
          <CardTitle>أفضل ممارسات تحسين الأداء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" />
                LCP (أكبر عنصر) - الهدف: &lt;2.5s
              </h4>
              <ul className="space-y-1 text-muted-foreground mr-6">
                <li>• استخدم lazy loading للصور</li>
                <li>• ضغط الصور واستخدام WebP</li>
                <li>• تحميل CSS المهم أولاً</li>
                <li>• استخدام preload للموارد الحرجة</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                TTFB (وقت الاستجابة) - الهدف: &lt;800ms
              </h4>
              <ul className="space-y-1 text-muted-foreground mr-6">
                <li>• استخدام CDN</li>
                <li>• تفعيل HTTP/2 أو HTTP/3</li>
                <li>• تحسين استعلامات قاعدة البيانات</li>
                <li>• تفعيل التخزين المؤقت</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                FCP (أول رسم) - الهدف: &lt;1.8s
              </h4>
              <ul className="space-y-1 text-muted-foreground mr-6">
                <li>• تقليل حجم JavaScript</li>
                <li>• تأجيل تحميل السكريبتات غير الضرورية</li>
                <li>• تقليل حجم CSS</li>
                <li>• إزالة موارد render-blocking</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                CLS (استقرار التخطيط) - الهدف: &lt;0.1
              </h4>
              <ul className="space-y-1 text-muted-foreground mr-6">
                <li>• تحديد أبعاد الصور والفيديو</li>
                <li>• حجز مساحة للإعلانات</li>
                <li>• تجنب إدراج محتوى ديناميكي فوق المحتوى</li>
                <li>• استخدام font-display: swap</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
