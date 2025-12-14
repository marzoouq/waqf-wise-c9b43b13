import { useSystemErrorLogsData } from "@/hooks/system/useSystemErrorLogsData";
import { Database } from "@/integrations/supabase/types";

type SystemErrorRow = Database['public']['Tables']['system_error_logs']['Row'];
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Clock, XCircle, TrendingUp, AlertCircle, Trash2 } from "lucide-react";
import { formatRelative } from "@/lib/date";

export default function SystemErrorLogs() {
  const {
    errorLogs,
    activeAlerts,
    stats,
    isLoading,
    selectedError,
    setSelectedError,
    resolutionNotes,
    setResolutionNotes,
    deleteResolved,
    isDeleting,
    updateError,
    isUpdating,
  } = useSystemErrorLogsData();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "high":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "medium":
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <TrendingUp className="h-5 w-5 text-info" />;
    }
  };

  const getSeverityColor = (severity: string): "destructive" | "default" | "secondary" | "outline" => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "investigating":
        return <Clock className="h-4 w-4 text-info" />;
      case "ignored":
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
  };

  return (
    <PageErrorBoundary pageName="سجلات الأخطاء">
      <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">سجلات الأخطاء والتنبيهات</h1>
        <p className="text-muted-foreground">مراقبة وإدارة أخطاء النظام</p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">إجمالي الأخطاء</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">جديدة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">{stats.new}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">قيد المعالجة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-info">{stats.investigating}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">محلولة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{stats.resolved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">حرجة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
          </CardContent>
        </Card>
      </div>

      {/* التنبيهات النشطة */}
      {activeAlerts && activeAlerts.length > 0 && (
        <Card className="border-destructive/50 bg-destructive-light">
          <CardHeader>
            <CardTitle className="text-destructive">تنبيهات نشطة</CardTitle>
            <CardDescription>مشاكل تتطلب انتباهاً فورياً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      تكرر {alert.occurrence_count} مرة
                    </p>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* سجلات الأخطاء */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>سجلات الأخطاء</CardTitle>
            <CardDescription>جميع الأخطاء المسجلة في النظام</CardDescription>
          </div>
          {stats.resolved > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteResolved()}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 ms-2" />
              حذف المحلولة ({stats.resolved})
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">الكل ({stats.total})</TabsTrigger>
              <TabsTrigger value="new">جديدة ({stats.new})</TabsTrigger>
              <TabsTrigger value="investigating">قيد المعالجة ({stats.investigating})</TabsTrigger>
              <TabsTrigger value="resolved">محلولة ({stats.resolved})</TabsTrigger>
            </TabsList>

            {["all", "new", "investigating", "resolved"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-3">
                {isLoading ? (
                  <p className="text-center py-8">جاري التحميل...</p>
                ) : (
                  errorLogs
                    ?.filter((log) => tab === "all" || log.status === tab)
                    .map((log) => (
                      <Dialog key={log.id}>
                        <DialogTrigger asChild>
                          <div
                            className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedError(log)}
                          >
                            <div className="flex items-start gap-3">
                              {getSeverityIcon(log.severity)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={getSeverityColor(log.severity)}>
                                    {log.severity}
                                  </Badge>
                                  <Badge variant="outline">{log.error_type}</Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    {getStatusIcon(log.status)}
                                    <span>{log.status}</span>
                                  </div>
                                </div>
                                <p className="font-medium">{log.error_message}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {formatRelative(log.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>تفاصيل الخطأ</DialogTitle>
                            <DialogDescription>
                              إدارة ومعالجة الخطأ
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">الرسالة:</h4>
                              <p className="text-sm bg-muted p-3 rounded">{log.error_message}</p>
                            </div>

                            {log.error_stack && (
                              <div>
                                <h4 className="font-semibold mb-2">Stack Trace:</h4>
                                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                  {log.error_stack}
                                </pre>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">النوع:</span>
                                <p className="font-medium">{log.error_type}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">الخطورة:</span>
                                <Badge variant={getSeverityColor(log.severity)}>{log.severity}</Badge>
                              </div>
                              <div>
                                <span className="text-muted-foreground">الحالة:</span>
                                <Badge variant="outline">{log.status}</Badge>
                              </div>
                              <div>
                                <span className="text-muted-foreground">الوقت:</span>
                                <p className="font-medium">
                                  {new Date(log.created_at).toLocaleString("ar-SA")}
                                </p>
                              </div>
                            </div>

                            {log.url && (
                              <div>
                                <span className="text-muted-foreground text-sm">الصفحة:</span>
                                <p className="text-sm font-mono break-all">{log.url}</p>
                              </div>
                            )}

                            <div className="space-y-3">
                              <Select
                                value={log.status}
                                onValueChange={(value) =>
                                  updateError({ id: log.id, status: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">جديد</SelectItem>
                                  <SelectItem value="investigating">قيد المعالجة</SelectItem>
                                  <SelectItem value="resolved">محلول</SelectItem>
                                  <SelectItem value="ignored">متجاهل</SelectItem>
                                </SelectContent>
                              </Select>

                              <Textarea
                                placeholder="ملاحظات الحل..."
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                rows={3}
                              />

                              <Button
                                onClick={() =>
                                  updateError({
                                    id: log.id,
                                    status: "resolved",
                                    notes: resolutionNotes,
                                  })
                                }
                                disabled={isUpdating}
                                className="w-full"
                              >
                                حفظ وتحديث الحالة
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </PageErrorBoundary>
  );
}
