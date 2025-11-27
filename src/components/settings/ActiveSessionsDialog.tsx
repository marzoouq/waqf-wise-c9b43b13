import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Chrome,
  Globe,
  MapPin,
  Clock,
  Shield,
  X,
  LogOut,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { useActiveSessions } from "@/hooks/useActiveSessions";
import { format, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ActiveSessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActiveSessionsDialog({ open, onOpenChange }: ActiveSessionsDialogProps) {
  const { 
    sessions, 
    isLoading, 
    endSession, 
    endAllOtherSessions,
    isEndingSession,
    isEndingAllSessions 
  } = useActiveSessions();
  
  const [sessionToEnd, setSessionToEnd] = useState<string | null>(null);
  const [showEndAllDialog, setShowEndAllDialog] = useState(false);

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return Globe;
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return Smartphone;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return Tablet;
    }
    return Monitor;
  };

  const getBrowserName = (userAgent?: string) => {
    if (!userAgent) return "متصفح غير معروف";
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    return 'متصفح آخر';
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await endSession(sessionId);
      setSessionToEnd(null);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleEndAllOtherSessions = async () => {
    try {
      await endAllOtherSessions();
      setShowEndAllDialog(false);
    } catch (error) {
      console.error('Error ending all sessions:', error);
    }
  };

  const currentSession = sessions.find(s => {
    const sessionAge = Date.now() - new Date(s.last_activity_at).getTime();
    return sessionAge < 60000; // Less than 1 minute old = current
  });

  const otherSessions = sessions.filter(s => s.id !== currentSession?.id);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              الجلسات النشطة
            </DialogTitle>
            <DialogDescription>
              إدارة جلسات تسجيل الدخول النشطة على جميع الأجهزة
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="max-h-[500px] pr-4">
              <div className="space-y-4">
                {/* Current Session */}
                {currentSession && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-muted-foreground">الجلسة الحالية</h3>
                      <Badge variant="default" className="bg-success text-success-foreground">
                        نشط الآن
                      </Badge>
                    </div>
                    <SessionCard session={currentSession} isCurrent />
                  </div>
                )}

                {/* Other Sessions */}
                {otherSessions.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          جلسات أخرى ({otherSessions.length})
                        </h3>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowEndAllDialog(true)}
                          disabled={isEndingAllSessions}
                        >
                          {isEndingAllSessions ? (
                            <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          ) : (
                            <LogOut className="h-4 w-4 ml-2" />
                          )}
                          إنهاء جميع الجلسات الأخرى
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {otherSessions.map((session) => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            onEnd={() => setSessionToEnd(session.id)}
                            isEnding={isEndingSession}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {sessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد جلسات نشطة</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* End Session Confirmation */}
      <AlertDialog open={!!sessionToEnd} onOpenChange={(open) => !open && setSessionToEnd(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              تأكيد إنهاء الجلسة
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إنهاء هذه الجلسة؟ سيتم تسجيل خروج هذا الجهاز فوراً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToEnd && handleEndSession(sessionToEnd)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              إنهاء الجلسة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End All Sessions Confirmation */}
      <AlertDialog open={showEndAllDialog} onOpenChange={setShowEndAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              تأكيد إنهاء جميع الجلسات
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إنهاء جميع الجلسات الأخرى؟ سيتم تسجيل خروج جميع الأجهزة الأخرى فوراً.
              ستبقى الجلسة الحالية نشطة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndAllOtherSessions}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              إنهاء جميع الجلسات
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface SessionData {
  id: string;
  user_agent?: string | null;
  ip_address?: string;
  created_at: string;
  last_activity_at?: string;
  device_info?: {
    browser?: string;
    os?: string;
    device_type?: string;
  } | null;
}

interface SessionCardProps {
  session: SessionData;
  isCurrent?: boolean;
  onEnd?: () => void;
  isEnding?: boolean;
}

function SessionCard({ session, isCurrent, onEnd, isEnding }: SessionCardProps) {
  const DeviceIcon = getDeviceIcon(session.user_agent);
  const browserName = getBrowserName(session.user_agent);

  return (
    <Card className={`p-4 ${isCurrent ? 'border-primary' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <DeviceIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{browserName}</span>
              {session.device_info?.os && (
                <Badge variant="secondary" className="text-xs">
                  {session.device_info.os}
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              {session.ip_address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span className="font-mono">{session.ip_address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>
                  آخر نشاط: {formatDistanceToNow(new Date(session.last_activity_at), {
                    addSuffix: true,
                    locale: ar,
                  })}
                </span>
              </div>
              <div className="text-xs opacity-70">
                تسجيل الدخول: {format(new Date(session.created_at), "PPp", { locale: ar })}
              </div>
            </div>
          </div>
        </div>
        
        {!isCurrent && onEnd && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onEnd}
            disabled={isEnding}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {isEnding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}

function getDeviceIcon(userAgent?: string) {
  if (!userAgent) return Globe;
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return Smartphone;
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return Tablet;
  }
  return Monitor;
}

function getBrowserName(userAgent?: string) {
  if (!userAgent) return "متصفح غير معروف";
  const ua = userAgent.toLowerCase();
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  return 'متصفح آخر';
}
