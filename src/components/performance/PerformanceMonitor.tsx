/**
 * مراقب الأداء - مكون لمراقبة أداء التطبيق في الوقت الفعلي
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  renderCount: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    loadTime: 0,
    renderCount: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // تفعيل المراقب فقط في بيئة التطوير
    if (import.meta.env.DEV) {
      setIsVisible(true);
    }

    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      const delta = currentTime - lastTime;

      if (delta >= 1000) {
        const fps = Math.round((frameCount * 1000) / delta);
        
        setMetrics((prev) => ({
          ...prev,
          fps,
          renderCount: prev.renderCount + 1,
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    // قياس استهلاك الذاكرة (إن وُجد)
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics((prev) => ({
          ...prev,
          memory: Math.round(memory.usedJSHeapSize / 1048576), // MB
        }));
      }
    };

    const memoryInterval = setInterval(measureMemory, 2000);

    // قياس وقت التحميل
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    setMetrics((prev) => ({ ...prev, loadTime: Math.round(loadTime) }));

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(memoryInterval);
    };
  }, []);

  if (!isVisible) return null;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-success';
    if (fps >= 30) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 opacity-80 hover:opacity-100 transition-opacity">
      <Card className="w-64 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            مراقب الأداء
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">FPS:</span>
            <Badge variant="outline" className={getFPSColor(metrics.fps)}>
              {metrics.fps}
            </Badge>
          </div>
          
          {metrics.memory > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" />
                الذاكرة:
              </span>
              <Badge variant="outline">{metrics.memory} MB</Badge>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              وقت التحميل:
            </span>
            <Badge variant="outline">{metrics.loadTime}ms</Badge>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-muted-foreground">العرض:</span>
            <span className="font-mono">{metrics.renderCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
