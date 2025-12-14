import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ArrowLeft, LucideIcon } from "lucide-react";
import { useAIInsights } from "@/hooks/useAIInsights";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/shared/ErrorState";

const categoryIcons: Record<string, LucideIcon> = {
  prediction: TrendingUp,
  recommendation: Lightbulb,
  anomaly: AlertTriangle,
  trend: TrendingUp,
};

const severityColors = {
  info: 'bg-info-light text-info',
  warning: 'bg-warning-light text-warning',
  critical: 'bg-destructive-light text-destructive',
};

export function AIInsightsWidget() {
  const navigate = useNavigate();
  const { insights, isLoading, error, refetch } = useAIInsights();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            الرؤى الذكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل الرؤى" message={(error as Error).message} onRetry={refetch} />;
  }

  const activeInsights = insights?.filter(i => !i.is_dismissed).slice(0, 3) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          الرؤى الذكية
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/ai-insights')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {activeInsights.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد رؤى ذكية جديدة
          </p>
        ) : (
          <div className="space-y-3">
            {activeInsights.map((insight) => {
              const Icon = categoryIcons[insight.alert_type] || Sparkles;
              const severityColor = severityColors[insight.severity as keyof typeof severityColors] || severityColors.info;

              return (
                <div key={insight.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className={`p-2 rounded-lg ${severityColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{insight.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {insight.severity === 'critical' && 'حرج'}
                        {insight.severity === 'warning' && 'تحذير'}
                        {insight.severity === 'info' && 'معلومة'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {insight.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
