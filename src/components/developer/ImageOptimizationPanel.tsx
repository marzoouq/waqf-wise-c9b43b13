/**
 * لوحة مراقبة تحسين الصور وLCP
 * للمطورين فقط
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useImageOptimization } from '@/hooks/ui/useImageOptimization';
import { Activity, Image as ImageIcon, Zap, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ImageStats {
  total: number;
  optimized: number;
  lazy: number;
  priority: number;
  avgSize: string;
}

export function ImageOptimizationPanel() {
  const { lcp } = useImageOptimization();
  const [imageStats, setImageStats] = useState<ImageStats>({
    total: 0,
    optimized: 0,
    lazy: 0,
    priority: 0,
    avgSize: '0 KB',
  });

  useEffect(() => {
    // حساب إحصائيات الصور
    const images = document.querySelectorAll('img');
    const optimized = document.querySelectorAll('img[data-optimized]');
    const lazy = document.querySelectorAll('img[loading="lazy"]');
    const priority = document.querySelectorAll('img[data-priority="high"]');

    setImageStats({
      total: images.length,
      optimized: optimized.length,
      lazy: lazy.length,
      priority: priority.length,
      avgSize: '~ KB', // يمكن حسابه من performance API
    });
  }, []);

  const getLCPStatus = (lcp: number | null) => {
    if (!lcp) return { label: 'قيد القياس...', variant: 'secondary' as const, icon: Activity };
    if (lcp <= 2500) return { label: 'ممتاز', variant: 'default' as const, icon: Zap };
    if (lcp <= 4000) return { label: 'يحتاج تحسين', variant: 'secondary' as const, icon: AlertTriangle };
    return { label: 'ضعيف', variant: 'destructive' as const, icon: AlertTriangle };
  };

  const lcpStatus = getLCPStatus(lcp);
  const LCPIcon = lcpStatus.icon;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          تحسين الصور وLCP
        </CardTitle>
        <CardDescription>
          مراقبة أداء الصور وLargest Contentful Paint
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* LCP Metrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">LCP (Largest Contentful Paint)</span>
            <Badge variant={lcpStatus.variant} className="gap-1">
              <LCPIcon className="h-3 w-3" />
              {lcpStatus.label}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-primary">
            {lcp ? `${lcp.toFixed(0)} ms` : 'قيد القياس...'}
          </div>
          <div className="text-xs text-muted-foreground">
            الهدف: {'<'} 2500ms (ممتاز) | {'<'} 4000ms (مقبول)
          </div>
        </div>

        {/* صور الصفحة */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-semibold">إحصائيات الصور</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">إجمالي الصور</div>
              <div className="text-lg font-bold">{imageStats.total}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">صور محسّنة</div>
              <div className="text-lg font-bold text-green-600">
                {imageStats.optimized}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Lazy Loading</div>
              <div className="text-lg font-bold text-blue-600">
                {imageStats.lazy}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">أولوية عالية</div>
              <div className="text-lg font-bold text-orange-600">
                {imageStats.priority}
              </div>
            </div>
          </div>
        </div>

        {/* توصيات */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-semibold">توصيات</h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            {imageStats.total > 0 && imageStats.optimized === 0 && (
              <div className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded">
                <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>لا توجد صور محسّنة. استخدم مكونات LazyImage.</span>
              </div>
            )}
            
            {lcp && lcp > 2500 && (
              <div className="flex items-start gap-2 p-2 bg-orange-500/10 rounded">
                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <span>
                  LCP أعلى من المستوى الموصى به. استخدم priority=true للصور المهمة.
                </span>
              </div>
            )}
            
            {imageStats.priority === 0 && imageStats.total > 0 && (
              <div className="flex items-start gap-2 p-2 bg-blue-500/10 rounded">
                <Activity className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  قم بتعيين priority=true للصور المرئية فوق الطية (above the fold).
                </span>
              </div>
            )}
            
            {imageStats.optimized > 0 && lcp && lcp <= 2500 && (
              <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded">
                <Zap className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  ممتاز! الصور محسّنة وLCP في المستوى الموصى به.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* روابط مفيدة */}
        <div className="pt-4 border-t">
          <a
            href="/docs/IMAGE_OPTIMIZATION.md"
            target="_blank"
            className="text-xs text-primary hover:underline"
          >
            📚 دليل تحسين الصور →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
