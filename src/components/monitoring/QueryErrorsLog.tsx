/**
 * سجل أخطاء الاستعلامات
 * Query Errors Log
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import type { QueryError } from "@/services/monitoring/db-health.service";

interface QueryErrorsLogProps {
  errors: QueryError[];
  isLoading: boolean;
}

export function QueryErrorsLog({ errors, isLoading }: QueryErrorsLogProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            أخطاء الاستعلامات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (errors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            أخطاء الاستعلامات
          </CardTitle>
          <CardDescription>لا توجد أخطاء حديثة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-green-500/50" />
            <p>لم يتم تسجيل أي أخطاء استعلامات مؤخراً</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'error':
        return <Badge variant="destructive">{severity}</Badge>;
      case 'warning':
        return <Badge variant="secondary">{severity}</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          أخطاء الاستعلامات
          <Badge variant="destructive">{errors.length}</Badge>
        </CardTitle>
        <CardDescription>
          أخطاء الاستعلامات المسجلة مؤخراً
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {errors.map((error) => (
              <div 
                key={error.id} 
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(error.severity)}
                    <Badge variant="outline">{error.error_type}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(error.created_at), { addSuffix: true, locale: ar })}
                  </div>
                </div>
                <p className="text-sm font-medium text-destructive mb-1">
                  {error.error_message}
                </p>
                {error.error_stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      عرض تفاصيل الخطأ
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {error.error_stack}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
