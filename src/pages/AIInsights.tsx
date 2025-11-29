import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, X, RefreshCw } from "lucide-react";
import { useAIInsights } from "@/hooks/useAIInsights";
import { LoadingState } from "@/components/shared/LoadingState";
import { EnhancedEmptyState } from "@/components/shared/EnhancedEmptyState";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import type { LucideIcon } from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  prediction: TrendingUp,
  recommendation: Lightbulb,
  anomaly: AlertTriangle,
  trend: TrendingUp,
};

const severityColors = {
  info: 'bg-info-light text-info border-info/20',
  warning: 'bg-warning-light text-warning border-warning/20',
  critical: 'bg-destructive-light text-destructive border-destructive/20',
};

export default function AIInsights() {
  const { insights, isLoading, generateInsights, isGenerating, dismissInsight } = useAIInsights();

  if (isLoading) {
    return <LoadingState message="جاري تحميل الرؤى الذكية..." />;
  }

  return (
    <PageErrorBoundary pageName="الرؤى الذكية">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="الرؤى الذكية بالـ AI"
          description="تحليلات ذكية وتوصيات مدعومة بالذكاء الاصطناعي"
          icon={<Sparkles className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => generateInsights('beneficiaries')}
                disabled={isGenerating}
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${isGenerating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">توليد رؤى المستفيدين</span>
                <span className="sm:hidden">مستفيدين</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateInsights('financial')}
                disabled={isGenerating}
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${isGenerating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">توليد رؤى مالية</span>
                <span className="sm:hidden">مالية</span>
              </Button>
            </div>
          }
        />

        {!insights || insights.length === 0 ? (
          <EnhancedEmptyState
            title="لا توجد رؤى ذكية حالياً"
            description="اضغط على زر توليد الرؤى للحصول على تحليلات ذكية"
            icon={Sparkles}
            action={{
              label: "توليد رؤى",
              onClick: () => generateInsights('beneficiaries'),
            }}
          />
        ) : (
          <div className="grid gap-4">
            {insights.map((insight) => {
              const Icon = categoryIcons[insight.alert_type] || Sparkles;
              const severityColor = severityColors[insight.severity as keyof typeof severityColors] || severityColors.info;

              return (
                <Card key={insight.id} className="relative">
                  <CardHeader className="flex flex-row items-start justify-between pb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${severityColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <Badge variant="outline" className={severityColor}>
                            {insight.severity === 'critical' && 'حرج'}
                            {insight.severity === 'warning' && 'تحذير'}
                            {insight.severity === 'info' && 'معلومة'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                        {insight.data && (
                          <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                            <pre className="text-xs overflow-auto">
                              {JSON.stringify(insight.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => dismissInsight(insight.id)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      تم الإنشاء: {new Date(insight.created_at).toLocaleString('ar-SA')}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
