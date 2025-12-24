/**
 * Login Attempts Section - قسم محاولات تسجيل الدخول
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KeyRound, CheckCircle, XCircle, Monitor, Smartphone, RefreshCw } from "lucide-react";
import { useLoginAttempts } from "@/hooks/security/useLoginAttempts";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export function LoginAttemptsSection() {
  const { loginAttempts, stats, isLoading, refetch } = useLoginAttempts(15);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            محاولات تسجيل الدخول
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Monitor className="h-4 w-4 text-muted-foreground" />;
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    return isMobile 
      ? <Smartphone className="h-4 w-4 text-muted-foreground" />
      : <Monitor className="h-4 w-4 text-muted-foreground" />;
  };

  const getBrowserName = (userAgent: string | null): string => {
    if (!userAgent) return "غير معروف";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "متصفح آخر";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          محاولات تسجيل الدخول
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">إجمالي</div>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
            <div className="text-xs text-muted-foreground">ناجحة</div>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-xs text-muted-foreground">فاشلة</div>
          </div>
        </div>

        {/* قائمة المحاولات */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {loginAttempts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد محاولات تسجيل دخول حديثة
              </div>
            ) : (
              loginAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {attempt.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium text-sm">
                        {attempt.user_email || "بريد غير معروف"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {getDeviceIcon(attempt.user_agent)}
                        <span>{getBrowserName(attempt.user_agent)}</span>
                        <span>•</span>
                        <span>{attempt.ip_address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={attempt.success ? "default" : "destructive"} className="text-xs">
                      {attempt.success ? "ناجح" : "فاشل"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(attempt.created_at), "dd MMM HH:mm", { locale: ar })}
                    </span>
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
