/**
 * بطاقة نتيجة صحة قاعدة البيانات
 * Database Health Score Card
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthScoreCardProps {
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  isLoading?: boolean;
}

export function HealthScoreCard({ score, status, isLoading }: HealthScoreCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'excellent':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          progressColor: 'bg-green-500',
          label: 'ممتاز',
        };
      case 'good':
        return {
          icon: Activity,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          progressColor: 'bg-blue-500',
          label: 'جيد',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          progressColor: 'bg-yellow-500',
          label: 'تحذير',
        };
      case 'critical':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          progressColor: 'bg-red-500',
          label: 'حرج',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">نتيجة الصحة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden", config.bgColor)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={cn("h-4 w-4", config.color)} />
          نتيجة الصحة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className={cn("text-3xl font-bold", config.color)}>{score}%</span>
          <span className={cn("text-sm font-medium px-2 py-1 rounded", config.bgColor, config.color)}>
            {config.label}
          </span>
        </div>
        <Progress 
          value={score} 
          className="h-2" 
        />
        <p className="text-xs text-muted-foreground mt-2">
          {status === 'excellent' && 'قاعدة البيانات في حالة ممتازة'}
          {status === 'good' && 'قاعدة البيانات في حالة جيدة مع بعض التحسينات الممكنة'}
          {status === 'warning' && 'يوجد بعض المشاكل التي تحتاج للمعالجة'}
          {status === 'critical' && 'يوجد مشاكل حرجة تحتاج للمعالجة الفورية'}
        </p>
      </CardContent>
    </Card>
  );
}
