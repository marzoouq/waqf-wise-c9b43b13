import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Trash2, Filter } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useSystemErrors, 
  useDeleteResolvedErrors, 
  useUpdateErrorStatus, 
  useDeleteAllErrors 
} from "@/hooks/developer/useSystemErrors";

export function ErrorsPanel() {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: errors, refetch } = useSystemErrors(severityFilter, statusFilter);
  const deleteResolvedErrors = useDeleteResolvedErrors();
  const updateErrorStatus = useUpdateErrorStatus();
  const deleteAllErrors = useDeleteAllErrors();

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return <Badge variant="destructive">حرج</Badge>;
      case "error":
        return <Badge variant="destructive">خطأ</Badge>;
      case "warning":
        return <Badge variant="secondary">تحذير</Badge>;
      case "info":
        return <Badge variant="outline">معلومات</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return <Badge className="bg-green-500">تم الحل</Badge>;
      case "investigating":
        return <Badge variant="secondary">قيد التحقيق</Badge>;
      case "new":
        return <Badge variant="destructive">جديد</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const errorStats = {
    total: errors?.length || 0,
    critical: errors?.filter(e => e.severity?.toLowerCase() === "critical").length || 0,
    resolved: errors?.filter(e => e.status?.toLowerCase() === "resolved").length || 0,
    active: errors?.filter(e => e.status?.toLowerCase() !== "resolved").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Error Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأخطاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              أخطاء حرجة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{errorStats.critical}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              أخطاء نشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{errorStats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              تم حلها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{errorStats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>سجل الأخطاء</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteResolvedErrors.mutate()}
              disabled={deleteResolvedErrors.isPending}
            >
              <Trash2 className="w-4 h-4 ms-2" />
              حذف المحلولة
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("هل أنت متأكد من حذف جميع الأخطاء؟")) {
                  deleteAllErrors.mutate();
                }
              }}
              disabled={deleteAllErrors.isPending}
            >
              <Trash2 className="w-4 h-4 ms-2" />
              حذف الكل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-4 h-4 ms-2" />
              تحديث
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm">الخطورة:</span>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="critical">حرج</SelectItem>
                  <SelectItem value="error">خطأ</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                  <SelectItem value="info">معلومات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">الحالة:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="new">جديد</SelectItem>
                  <SelectItem value="investigating">قيد التحقيق</SelectItem>
                  <SelectItem value="resolved">محلول</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {!errors || errors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>لا توجد أخطاء مسجلة</p>
              </div>
            ) : (
              errors.map((error) => (
                <div
                  key={error.id}
                  className="border rounded-lg p-4 space-y-2 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityBadge(error.severity || "")}
                        {getStatusBadge(error.status || "")}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(error.created_at), "PPp", { locale: ar })}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm">{error.error_type}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {error.error_message}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {error.status !== "resolved" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateErrorStatus.mutate({ 
                            id: error.id, 
                            status: "resolved" 
                          })}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {error.error_stack && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        عرض Stack Trace
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {error.error_stack}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
