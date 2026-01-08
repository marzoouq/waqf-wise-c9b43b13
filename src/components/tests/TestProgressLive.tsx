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

interface TestProgress {
  total: number;
  completed: number;
  passed: number;
  failed: number;
  currentTest: string;
  currentCategory: string;
  isRunning: boolean;
  startTime: Date | null;
}

interface RecentResult {
  testId: string;
  testName: string;
  success: boolean;
  duration: number;
  timestamp: Date;
}

interface TestProgressLiveProps {
  progress: TestProgress;
  recentResults: RecentResult[];
}

export function TestProgressLive({ progress, recentResults }: TestProgressLiveProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // تحديث الوقت المنقضي
  useEffect(() => {
    if (!progress.isRunning || !progress.startTime) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - progress.startTime!.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [progress.isRunning, progress.startTime]);

  // التمرير التلقائي للأسفل
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [recentResults.length]);

  const percentComplete = progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100) 
    : 0;

  const estimatedRemaining = progress.completed > 0 && progress.isRunning
    ? Math.round((elapsedTime / progress.completed) * (progress.total - progress.completed))
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!progress.isRunning && progress.completed === 0) {
    return null;
  }

  return (
    <Card className="border-primary/50">
      <CardContent className="pt-6 space-y-4">
        {/* الشريط العلوي */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {progress.isRunning ? (
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <TestTube className="h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
              </div>
            ) : (
              <CheckCircle className="h-8 w-8 text-green-500" />
            )}
            <div>
              <h3 className="font-semibold">
                {progress.isRunning ? 'جاري تنفيذ الاختبارات...' : 'اكتمل التنفيذ'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {progress.completed} من {progress.total} اختبار
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
              {progress.isRunning && estimatedRemaining > 0 && (
                <div className="text-xs text-muted-foreground">
                  متبقي: ~{formatTime(estimatedRemaining)}
                </div>
              )}
            </div>

            {/* إحصائيات سريعة */}
            <div className="flex gap-2">
              <Badge variant="outline" className="text-green-500 bg-green-500/10">
                <CheckCircle className="h-3 w-3 mr-1" />
                {progress.passed}
              </Badge>
              <Badge variant="outline" className="text-red-500 bg-red-500/10">
                <XCircle className="h-3 w-3 mr-1" />
                {progress.failed}
              </Badge>
            </div>
          </div>
        </div>

        {/* شريط التقدم الرئيسي */}
        <div className="space-y-2">
          <Progress value={percentComplete} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{percentComplete}% مكتمل</span>
            <span>{progress.total - progress.completed} متبقي</span>
          </div>
        </div>

        {/* الاختبار الحالي */}
        {progress.isRunning && progress.currentTest && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {progress.currentTest}
              </div>
              {progress.currentCategory && (
                <div className="text-xs text-muted-foreground">
                  {progress.currentCategory}
                </div>
              )}
            </div>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}

        {/* آخر النتائج (متحركة) */}
        {recentResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">آخر النتائج:</h4>
            <ScrollArea className="h-32" ref={scrollRef as any}>
              <div className="space-y-1">
                {recentResults.slice(-8).map((result, index) => (
                  <div
                    key={`${result.testId}-${index}`}
                    className={cn(
                      "flex items-center justify-between p-2 rounded text-sm transition-all",
                      result.success 
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400",
                      index === recentResults.length - 1 && "animate-pulse"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {result.success ? (
                        <CheckCircle className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="truncate">{result.testName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{result.duration}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* شريط التقدم حسب النوع */}
        {progress.isRunning && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-green-500/10">
              <span>نجاح</span>
              <span className="font-bold text-green-500">
                {progress.completed > 0 
                  ? Math.round((progress.passed / progress.completed) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-red-500/10">
              <span>فشل</span>
              <span className="font-bold text-red-500">
                {progress.completed > 0 
                  ? Math.round((progress.failed / progress.completed) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
