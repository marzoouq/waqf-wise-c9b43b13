import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Users, AlertCircle, Inbox } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { useGovernanceData } from "@/hooks/useGovernanceData";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export function GovernanceTab() {
  const { settings } = useVisibilitySettings();
  const { meetings, decisions, auditReports, isLoading, hasMeetings, hasDecisions, hasAuditReports } = useGovernanceData();

  if (!settings?.show_governance) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          غير مصرح بعرض معلومات الحوكمة
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {settings?.show_governance_meetings && (
        hasMeetings ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                اجتماعات مجلس الإدارة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                    <h4 className="font-medium">{meeting.title || "اجتماع"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {meeting.date ? format(new Date(meeting.date), "dd MMMM yyyy", { locale: ar }) : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
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
            <CardContent className="p-12 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد اجتماعات مسجلة</p>
            </CardContent>
          </Card>
        )
      )}

      {settings?.show_nazer_decisions && (
        hasDecisions ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                قرارات الناظر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {decisions.map((decision) => (
                <div key={decision.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{decision.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {decision.date ? format(new Date(decision.date), "dd MMMM yyyy", { locale: ar }) : ""}
                    </p>
                  </div>
                  <Badge className="bg-success">{decision.status || "نافذ"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد قرارات مُعلنة</p>
            </CardContent>
          </Card>
        )
      )}

      {settings?.show_policy_changes && (
        <Card>
          <CardContent className="p-12 text-center">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد تغييرات في السياسات</p>
          </CardContent>
        </Card>
      )}

      {settings?.show_audit_reports && (
        hasAuditReports ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                تقارير المراجعة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {auditReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{report.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.date ? format(new Date(report.date), "dd MMMM yyyy", { locale: ar }) : ""}
                    </p>
                  </div>
                  <Badge className="bg-success">{report.status || "مكتمل"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد تقارير مراجعة</p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
