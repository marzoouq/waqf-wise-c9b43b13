/**
 * عرض نشاط المستفيدين المباشر للناظر
 * يظهر من متصل حالياً والقسم الذي يتصفحه
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useBeneficiaryActivitySessions, 
  getPageName,
  type BeneficiarySession 
} from "@/hooks/nazer/useBeneficiaryActivitySessions";
import { 
  Users, Clock, MapPin, Wifi, WifiOff,
  Eye, Calendar, Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

function getTimeAgo(date: string): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ar });
  } catch {
    return "غير معروف";
  }
}

export function BeneficiaryActivityMonitor() {
  const { 
    sessions, 
    onlineSessions, 
    offlineSessions, 
    isLoading,
    error,
    refetch
  } = useBeneficiaryActivitySessions();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>نشاط المستفيدين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>نشاط المستفيدين</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Users className="h-10 w-10 mx-auto text-destructive mb-2 opacity-70" />
          <p className="text-destructive font-medium">فشل تحميل بيانات النشاط</p>
          <button onClick={() => refetch()} className="text-primary text-sm mt-2 hover:underline">
            إعادة المحاولة
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>نشاط المستفيدين المباشر</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <div className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
              {onlineSessions.length} متصل
            </Badge>
          </div>
        </div>
        <CardDescription>متابعة مباشرة لتصفح المستفيدين والورثة</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>لا يوجد نشاط حالياً</p>
              <p className="text-xs mt-1">سيظهر هنا نشاط المستفيدين عند تصفحهم للمنصة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* المتصلون حالياً */}
              {onlineSessions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Wifi className="h-3 w-3 text-status-success" />
                    متصلون الآن ({onlineSessions.length})
                  </p>
                  {onlineSessions.map((session) => (
                    <SessionCard key={session.id} session={session} isOnline />
                  ))}
                </div>
              )}

              {/* آخر نشاط */}
              {offlineSessions.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <WifiOff className="h-3 w-3" />
                    آخر نشاط ({offlineSessions.length})
                  </p>
                  {offlineSessions.map((session) => (
                    <SessionCard key={session.id} session={session} isOnline={false} />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface SessionCardProps {
  session: BeneficiarySession;
  isOnline: boolean;
}

function SessionCard({ session, isOnline }: SessionCardProps) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border transition-colors",
      isOnline ? "bg-status-success/5 border-status-success/20" : "bg-muted/30"
    )}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={cn(
              "text-sm",
              isOnline ? "bg-status-success/20 text-status-success" : "bg-muted"
            )}>
              {session.beneficiary?.full_name?.charAt(0) || "؟"}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-status-success border-2 border-background animate-pulse" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{session.beneficiary?.full_name || "مستفيد"}</p>
            {session.beneficiary?.category && (
              <Badge variant="outline" className="text-[10px] h-4">
                {session.beneficiary.category}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {getPageName(session.current_page)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getTimeAgo(session.last_activity)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Badge className="bg-status-success/10 text-status-success border-status-success/20 text-xs">
            <Eye className="h-3 w-3 ms-1" />
            يتصفح
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 ms-1" />
            {new Date(session.session_start).toLocaleDateString("ar-SA")}
          </Badge>
        )}
      </div>
    </div>
  );
}
