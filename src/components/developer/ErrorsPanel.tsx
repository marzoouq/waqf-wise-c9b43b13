import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function ErrorsPanel() {
  const { data: errors, refetch } = useQuery({
    queryKey: ["system-errors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    }
  });

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </CardHeader>
        <CardContent>
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
