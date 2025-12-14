import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { FileText, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ErrorState } from "@/components/shared/ErrorState";

export function AuditLogsPreview() {
  const { data: logs, isLoading, error, refetch } = useAuditLogs();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            سجل العمليات الأخير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل سجل العمليات" message={(error as Error).message} onRetry={refetch} />;
  }

  if (!logs) return null;

  const recentLogs = logs.slice(0, 10);

  const getActionColor = (actionType: string) => {
    if (actionType.includes('INSERT') || actionType.includes('CREATE')) {
      return 'bg-status-success/10 text-status-success border-status-success/20';
    }
    if (actionType.includes('UPDATE') || actionType.includes('EDIT')) {
      return 'bg-status-info/10 text-status-info border-status-info/20';
    }
    if (actionType.includes('DELETE') || actionType.includes('REMOVE')) {
      return 'bg-status-error/10 text-status-error border-status-error/20';
    }
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          سجل العمليات الأخير
        </CardTitle>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => navigate('/audit-logs')}
        >
          عرض الكل
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد عمليات مسجلة</p>
              </div>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getActionColor(log.action_type)}`}
                      >
                        {log.action_type}
                      </Badge>
                      {log.table_name && (
                        <span className="text-xs text-muted-foreground">
                          في {log.table_name}
                        </span>
                      )}
                    </div>
                    {log.description && (
                      <p className="text-sm mb-2">{log.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {log.user_email && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user_email}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.created_at || '').toLocaleString('ar-SA')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
