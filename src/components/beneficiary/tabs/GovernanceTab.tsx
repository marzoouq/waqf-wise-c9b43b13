import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Users, Inbox, ScrollText, BookOpen, ExternalLink } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { useGovernanceData } from "@/hooks/governance/useGovernanceData";
import { format, arLocale as ar } from "@/lib/date";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { useNavigate } from "react-router-dom";
import { CoreValuesSection } from "@/components/governance/CoreValuesSection";

export function GovernanceTab() {
  const { settings } = useVisibilitySettings();
  const { meetings, decisions, auditReports, isLoading, hasMeetings, hasDecisions, hasAuditReports } = useGovernanceData();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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
      {/* الدليل الإرشادي والحوكمة */}
      <Card className="border-destructive/30 bg-gradient-to-br from-destructive/5 to-background overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <ScrollText className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base">الدليل الإرشادي والحوكمة</CardTitle>
                <CardDescription className="text-[10px] sm:text-xs mt-0.5">
                  اللائحة التنفيذية لوقف مرزوق علي الثبيتي
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] sm:text-xs border-destructive/30 text-destructive shrink-0">
              <BookOpen className="h-3 w-3 ms-1" />
              17 جزء
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3 space-y-4">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            يحتوي هذا الدليل على القيم الأساسية للوقف، الهيكل التنظيمي، صلاحيات الناظر،
            آلية توزيع الأرباح، وسياسات الاستثمار والحوكمة.
          </p>
          
          {/* القيم الأساسية مختصرة */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { icon: "🛡️", label: "الأمانة" },
              { icon: "💚", label: "النزاهة" },
              { icon: "👁️", label: "الشفافية" },
              { icon: "⚖️", label: "العدالة" },
            ].map((value) => (
              <div key={value.label} className="flex items-center gap-2 p-2 sm:p-2.5 bg-muted/50 rounded-lg">
                <span className="text-base sm:text-lg">{value.icon}</span>
                <span className="text-[10px] sm:text-xs font-medium">{value.label}</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => navigate('/governance/guide')}
            variant="outline"
            className="w-full border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-xs sm:text-sm"
          >
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 ms-2" />
            عرض الدليل الكامل واللائحة التنفيذية
          </Button>
        </CardContent>
      </Card>

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
                    <h4 className="font-medium text-xs sm:text-sm truncate">{meeting.meeting_title || "اجتماع"}</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {meeting.scheduled_date ? format(new Date(meeting.scheduled_date), "dd MMMM yyyy", { locale: ar }) : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-start text-[10px] sm:text-xs shrink-0">
                    <p className="text-muted-foreground">{meeting.attendees_count || 0} حاضر</p>
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
                    <h4 className="font-medium text-xs sm:text-sm truncate">{decision.decision_title}</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {decision.decision_date ? format(new Date(decision.decision_date), "dd MMMM yyyy", { locale: ar }) : ""}
                    </p>
                  </div>
                  <Badge className="bg-success text-[10px] sm:text-xs shrink-0">{decision.decision_status || "نافذ"}</Badge>
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
                    <h4 className="font-medium text-xs sm:text-sm truncate">{report.description || "تقرير تدقيق"}</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {report.created_at ? format(new Date(report.created_at), "dd MMMM yyyy", { locale: ar }) : ""}
                    </p>
                  </div>
                  <Badge className="bg-success text-[10px] sm:text-xs shrink-0">{report.severity || "مكتمل"}</Badge>
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
