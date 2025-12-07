/**
 * عرض نشاط المستفيدين المباشر للناظر
 * يظهر من متصل حالياً والقسم الذي يتصفحه
 */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, Clock, MapPin, Monitor, Wifi, WifiOff,
  Eye, Calendar, Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface BeneficiarySession {
  id: string;
  beneficiary_id: string;
  current_page: string | null;
  current_section: string | null;
  last_activity: string;
  is_online: boolean;
  session_start: string;
  beneficiary?: {
    full_name: string;
    phone: string;
    category: string;
  };
}

// ترجمة أسماء الصفحات
const PAGE_NAMES: Record<string, string> = {
  "/beneficiary-portal": "الصفحة الرئيسية",
  "/beneficiary-portal/profile": "الملف الشخصي",
  "/beneficiary-portal/distributions": "التوزيعات",
  "/beneficiary-portal/statements": "كشف الحساب",
  "/beneficiary-portal/properties": "العقارات",
  "/beneficiary-portal/family": "العائلة",
  "/beneficiary-portal/waqf": "الوقف",
  "/beneficiary-portal/governance": "الحوكمة",
  "/beneficiary-portal/budgets": "الميزانيات",
  "/beneficiary-portal/requests": "الطلبات",
  "/beneficiary-portal/documents": "المستندات",
  "/beneficiary-portal/loans": "القروض",
  "/beneficiary-dashboard": "لوحة التحكم",
};

function getPageName(path: string | null): string {
  if (!path) return "غير محدد";
  return PAGE_NAMES[path] || path.split("/").pop() || "غير محدد";
}

function getTimeAgo(date: string): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ar });
  } catch {
    return "غير معروف";
  }
}

export function BeneficiaryActivityMonitor() {
  const [realtimeSessions, setRealtimeSessions] = useState<BeneficiarySession[]>([]);

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ["beneficiary-sessions-live"],
    queryFn: async () => {
      // جلب الجلسات مع بيانات المستفيدين
      const { data, error } = await supabase
        .from("beneficiary_sessions")
        .select(`
          id,
          beneficiary_id,
          current_page,
          current_section,
          last_activity,
          is_online,
          session_start,
          beneficiaries:beneficiary_id (
            full_name,
            phone,
            category
          )
        `)
        .order("last_activity", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return (data || []).map(session => ({
        ...session,
        beneficiary: session.beneficiaries as BeneficiarySession['beneficiary']
      }));
    },
    staleTime: 30 * 1000, // 30 ثانية
    refetchInterval: 60 * 1000, // تحديث كل دقيقة
  });

  // الاشتراك في التحديثات المباشرة
  useEffect(() => {
    const channel = supabase
      .channel("beneficiary-sessions-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "beneficiary_sessions",
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // تحديد المتصلين حالياً (نشاط خلال آخر 5 دقائق)
  const onlineSessions = sessions.filter(s => {
    const lastActivity = new Date(s.last_activity);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastActivity > fiveMinutesAgo && s.is_online;
  });

  const offlineSessions = sessions.filter(s => {
    const lastActivity = new Date(s.last_activity);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastActivity <= fiveMinutesAgo || !s.is_online;
  });

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
            <Eye className="h-3 w-3 ml-1" />
            يتصفح
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 ml-1" />
            {new Date(session.session_start).toLocaleDateString("ar-SA")}
          </Badge>
        )}
      </div>
    </div>
  );
}
