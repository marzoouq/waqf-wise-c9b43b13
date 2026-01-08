/**
 * مكون عرض تقدم الاختبارات في الوقت الحقيقي
 */

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, CheckCircle, XCircle, Clock, 
  Zap, Timer, TestTube
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentResult {
  name: string;
  success: boolean;
}

interface TestProgressLiveProps {
  currentTest: string;
  completed: number;
  total: number;
  passed: number;
  failed: number;
  recentResults: RecentResult[];
}

export function TestProgressLive({ 
  currentTest, 
  completed, 
  total, 
  passed, 
  failed,
  recentResults 
}: TestProgressLiveProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  // تحديث الوقت المنقضي
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // التمرير التلقائي للأسفل
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [recentResults.length]);

  const percentComplete = total > 0 
    ? Math.round((completed / total) * 100) 
    : 0;

  const estimatedRemaining = completed > 0
    ? Math.round((elapsedTime / completed) * (total - completed))
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-primary/50">
      <CardContent className="pt-6 space-y-4">
        {/* الشريط العلوي */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <TestTube className="h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">جاري تنفيذ الاختبارات...</h3>
              <p className="text-sm text-muted-foreground">
                {completed} من {total} اختبار
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* الوقت */}
            <div className="text-left">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span>منقضي: {formatTime(elapsedTime)}</span>
              </div>
              {estimatedRemaining > 0 && (
                <div className="text-xs text-muted-foreground">
                  متبقي: ~{formatTime(estimatedRemaining)}
                </div>
              )}
            </div>

            {/* إحصائيات سريعة */}
            <div className="flex gap-2">
              <Badge variant="outline" className="text-green-500 bg-green-500/10">
                <CheckCircle className="h-3 w-3 mr-1" />
                {passed}
              </Badge>
              <Badge variant="outline" className="text-red-500 bg-red-500/10">
                <XCircle className="h-3 w-3 mr-1" />
                {failed}
              </Badge>
            </div>
          </div>
        </div>

        {/* شريط التقدم الرئيسي */}
        <div className="space-y-2">
          <Progress value={percentComplete} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{percentComplete}% مكتمل</span>
            <span>{total - completed} متبقي</span>
          </div>
        </div>

        {/* الاختبار الحالي */}
        {currentTest && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {currentTest}
              </div>
            </div>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}

        {/* آخر النتائج */}
        {recentResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">آخر النتائج:</h4>
            <ScrollArea className="h-24" ref={scrollRef as any}>
              <div className="space-y-1">
                {recentResults.slice(-6).map((result, index) => (
                  <div
                    key={`${result.name}-${index}`}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded text-sm",
                      result.success 
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                    )}
                  >
                    {result.success ? (
                      <CheckCircle className="h-3 w-3 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-3 w-3 flex-shrink-0" />
                    )}
                    <span className="truncate">{result.name}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
