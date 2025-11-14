import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSmartAlerts } from '@/hooks/useSmartAlerts';
import { 
  AlertTriangle, 
  TrendingUp, 
  Lightbulb, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SmartAlerts() {
  const { alerts, isLoading, alertsStats, generateInsights, markAsRead, dismissAlert, isGenerating } = useSmartAlerts();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'anomaly':
        return AlertTriangle;
      case 'prediction':
        return TrendingUp;
      case 'recommendation':
        return Lightbulb;
      default:
        return Sparkles;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">التنبيهات الذكية</h1>
            <p className="text-muted-foreground mt-2">
              رؤى وتوصيات ذكية تم إنشاؤها بالذكاء الاصطناعي
            </p>
          </div>
          <Button onClick={() => generateInsights()} disabled={isGenerating}>
            <RefreshCw className={`ml-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            تحديث الرؤى
          </Button>
        </div>

        {/* إحصائيات */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>إجمالي التنبيهات</CardDescription>
              <CardTitle className="text-3xl">{alertsStats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>غير مقروءة</CardDescription>
              <CardTitle className="text-3xl text-primary">{alertsStats.unread}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>حرجة</CardDescription>
              <CardTitle className="text-3xl text-destructive">{alertsStats.critical}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>تحذيرات</CardDescription>
              <CardTitle className="text-3xl text-yellow-500">{alertsStats.warnings}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* قائمة التنبيهات */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">جاري التحميل...</p>
              </CardContent>
            </Card>
          ) : alerts && alerts.length > 0 ? (
            alerts.map((alert) => {
              const TypeIcon = getTypeIcon(alert.alert_type);
              return (
                <Card 
                  key={alert.id} 
                  className={`${!alert.is_read ? 'border-l-4 border-l-primary' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          alert.severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                          alert.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-primary/10 text-primary'
                        }`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-start gap-2">
                            <h3 className="font-semibold text-lg flex-1">{alert.title}</h3>
                            <div className="flex gap-2">
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity === 'critical' ? 'حرج' :
                                 alert.severity === 'warning' ? 'تحذير' : 'معلومة'}
                              </Badge>
                              <Badge variant="outline">
                                {alert.alert_type === 'anomaly' ? 'شذوذ' :
                                 alert.alert_type === 'prediction' ? 'توقع' : 'توصية'}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{alert.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              {new Date(alert.triggered_at).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!alert.is_read && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => markAsRead(alert.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => dismissAlert(alert.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {alert.action_url && (
                    <CardContent>
                      <Link to={alert.action_url}>
                        <Button variant="outline" className="w-full">
                          عرض التفاصيل
                          <ArrowRight className="mr-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  )}
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-10 text-center space-y-2">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">لا توجد تنبيهات ذكية حالياً</p>
                <Button variant="outline" onClick={() => generateInsights()}>
                  <RefreshCw className="ml-2 h-4 w-4" />
                  توليد رؤى جديدة
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}