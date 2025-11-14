import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, X, RefreshCw } from "lucide-react";
import { useAIInsights } from "@/hooks/useAIInsights";
import { LoadingState } from "@/components/shared/LoadingState";
import { EnhancedEmptyState } from "@/components/shared/EnhancedEmptyState";

const categoryIcons: Record<string, any> = {
  prediction: TrendingUp,
  recommendation: Lightbulb,
  anomaly: AlertTriangle,
  trend: TrendingUp,
};

const severityColors = {
  info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function AIInsights() {
  const { insights, isLoading, generateInsights, isGenerating, dismissInsight } = useAIInsights();

  if (isLoading) {
    return <LoadingState message="جاري تحميل الرؤى الذكية..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gradient-primary">
                الرؤى الذكية بالـ AI
              </h1>
              <p className="text-muted-foreground">
                تحليلات ذكية وتوصيات مدعومة بالذكاء الاصطناعي
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => generateInsights('beneficiaries')}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${isGenerating ? 'animate-spin' : ''}`} />
              توليد رؤى المستفيدين
            </Button>
            <Button
              variant="outline"
              onClick={() => generateInsights('financial')}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${isGenerating ? 'animate-spin' : ''}`} />
              توليد رؤى مالية
            </Button>
          </div>
        </header>

        {!insights || insights.length === 0 ? (
          <EnhancedEmptyState
            title="لا توجد رؤى ذكية حالياً"
            description="اضغط على زر توليد الرؤى للحصول على تحليلات ذكية"
            icon={Sparkles}
            action={{
              label: "توليد رؤى",
              onClick: () => generateInsights('general'),
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
      </div>
    </div>
  );
}
