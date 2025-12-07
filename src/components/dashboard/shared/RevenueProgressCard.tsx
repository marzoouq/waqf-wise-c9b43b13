import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRevenueProgress } from "@/hooks/dashboard/useRevenueProgress";

export function RevenueProgressCard() {
  const { data, isLoading } = useRevenueProgress();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="border-l-4 border-l-success">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-success" />
          تقدم الإيرادات للسنة المالية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">نسبة التحصيل</span>
            <span className="font-bold text-success">{data.progress.toFixed(1)}%</span>
          </div>
          <Progress value={data.progress} className="h-3" />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-2 bg-success/10 rounded-lg">
            <Wallet className="h-4 w-4 mx-auto mb-1 text-success" />
            <span className="text-sm font-bold block">{data.totalCollected.toLocaleString('ar-SA')}</span>
            <span className="text-xs text-muted-foreground">المحصل</span>
          </div>
          <div className="text-center p-2 bg-primary/10 rounded-lg">
            <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
            <span className="text-sm font-bold block">{data.expectedRevenue.toLocaleString('ar-SA')}</span>
            <span className="text-xs text-muted-foreground">المتوقع</span>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <span className="text-sm font-bold block">{data.netRevenue.toLocaleString('ar-SA')}</span>
            <span className="text-xs text-muted-foreground">الصافي</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
