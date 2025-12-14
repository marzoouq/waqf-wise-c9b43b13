import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Users, AlertCircle, Inbox } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { useGovernanceData } from "@/hooks/useGovernanceData";
import { format, arLocale as ar } from "@/lib/date";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { ErrorState } from "@/components/shared/ErrorState";

export function GovernanceTab() {
  const { settings } = useVisibilitySettings();
  // Note: useGovernanceData returns static empty data currently, no error/refetch available
  const { meetings, decisions, auditReports, isLoading, hasMeetings, hasDecisions, hasAuditReports } = useGovernanceData();
  const isMobile = useIsMobile();

  if (!settings?.show_governance) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6 text-center text-muted-foreground text-xs sm:text-sm">
          غير مصرح بعرض معلومات الحوكمة
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <Skeleton className="h-5 w-36 sm:h-6 sm:w-48" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <Skeleton className="h-20 sm:h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {settings?.show_governance_meetings && (
        hasMeetings ? (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                اجتماعات مجلس الإدارة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-xs sm:text-sm truncate">{meeting.title || "اجتماع"}</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {meeting.date ? format(new Date(meeting.date), "dd MMMM yyyy", { locale: ar }) : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] sm:text-xs shrink-0">
                  {meeting.attendees && (
                      <p className="text-muted-foreground">{meeting.attendees} حاضر</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <Inbox className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <p className="text-muted-foreground text-xs sm:text-sm">لا توجد اجتماعات مسجلة</p>
            </CardContent>
          </Card>
        )
      )}

      {settings?.show_nazer_decisions && (
        hasDecisions ? (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                قرارات الناظر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              {decisions.map((decision) => (
                <div key={decision.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-xs sm:text-sm truncate">{decision.title}</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {decision.date ? format(new Date(decision.date), "dd MMMM yyyy", { locale: ar }) : ""}
                    </p>
                  </div>
                  <Badge className="bg-success text-[10px] sm:text-xs shrink-0">{decision.status || "نافذ"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <Inbox className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <p className="text-muted-foreground text-xs sm:text-sm">لا توجد قرارات مُعلنة</p>
            </CardContent>
          </Card>
        )
      )}

      {settings?.show_policy_changes && (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <Inbox className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
            <p className="text-muted-foreground text-xs sm:text-sm">لا توجد تغييرات في السياسات</p>
          </CardContent>
        </Card>
      )}

      {settings?.show_audit_reports && (
        hasAuditReports ? (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                تقارير المراجعة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              {auditReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-xs sm:text-sm truncate">{report.title}</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {report.date ? format(new Date(report.date), "dd MMMM yyyy", { locale: ar }) : ""}
                    </p>
                  </div>
                  <Badge className="bg-success text-[10px] sm:text-xs shrink-0">{report.status || "مكتمل"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <Inbox className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <p className="text-muted-foreground text-xs sm:text-sm">لا توجد تقارير مراجعة</p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
