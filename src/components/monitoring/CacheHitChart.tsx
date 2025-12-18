/**
 * رسم بياني لنسبة Cache Hit
 * Cache Hit Ratio Gauge Chart
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface CacheHitChartProps {
  ratio: number;
  isLoading: boolean;
}

export function CacheHitChart({ ratio, isLoading }: CacheHitChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const getStatus = () => {
    if (ratio >= 99) return { 
      label: 'ممتاز', 
      color: 'bg-success text-success-foreground',
      icon: CheckCircle,
      description: 'أداء ممتاز - معظم البيانات تُقرأ من الذاكرة'
    };
    if (ratio >= 95) return { 
      label: 'جيد', 
      color: 'bg-warning text-warning-foreground',
      icon: AlertTriangle,
      description: 'أداء جيد - يمكن تحسينه قليلاً'
    };
    return { 
      label: 'يحتاج تحسين', 
      color: 'bg-destructive text-destructive-foreground',
      icon: XCircle,
      description: 'أداء ضعيف - راجع الاستعلامات والفهارس'
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Cache Hit Ratio</span>
          <Badge className={status.color}>
            <StatusIcon className="w-3 h-3 me-1" />
            {status.label}
          </Badge>
        </CardTitle>
        <CardDescription>
          نسبة البيانات المقروءة من الذاكرة بدلاً من القرص
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={ratio >= 99 ? 'hsl(var(--success))' : ratio >= 95 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(ratio / 100) * 440} 440`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{ratio.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">الحد الأدنى المقبول</span>
            <span className="font-medium">95%</span>
          </div>
          <Progress value={95} className="h-2" />
        </div>

        <p className="text-sm text-muted-foreground text-center">
          {status.description}
        </p>
      </CardContent>
    </Card>
  );
}
