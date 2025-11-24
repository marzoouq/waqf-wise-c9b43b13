import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Users, AlertCircle } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function GovernanceTab() {
  const { settings } = useVisibilitySettings();

  if (!settings?.show_governance) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          غير مصرح بعرض معلومات الحوكمة
        </CardContent>
      </Card>
    );
  }

  const governanceData = {
    meetings: [
      {
        id: "1",
        title: "اجتماع مجلس الإدارة الربعي",
        date: new Date(2024, 10, 15),
        attendees: 8,
        decisions: 5,
      },
      {
        id: "2",
        title: "اجتماع مراجعة الميزانية السنوية",
        date: new Date(2024, 9, 20),
        attendees: 12,
        decisions: 8,
      },
    ],
    nazerDecisions: [
      {
        id: "1",
        title: "الموافقة على توزيع الغلة السنوية",
        date: new Date(2024, 10, 10),
        status: "نافذ",
      },
      {
        id: "2",
        title: "اعتماد ميزانية الصيانة",
        date: new Date(2024, 9, 15),
        status: "نافذ",
      },
    ],
    policyChanges: [
      {
        id: "1",
        title: "تحديث سياسة القروض الحسنة",
        date: new Date(2024, 10, 5),
        impact: "متوسط",
      },
    ],
    auditReports: [
      {
        id: "1",
        title: "تقرير المراجعة السنوية 2024",
        date: new Date(2024, 9, 1),
        status: "مكتمل",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {settings?.show_governance_meetings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              اجتماعات مجلس الإدارة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {governanceData.meetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">{meeting.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(meeting.date, "dd MMMM yyyy", { locale: ar })}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">{meeting.attendees} حاضر</p>
                  <p className="text-muted-foreground">{meeting.decisions} قرار</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {settings?.show_nazer_decisions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              قرارات الناظر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {governanceData.nazerDecisions.map((decision) => (
              <div key={decision.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{decision.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(decision.date, "dd MMMM yyyy", { locale: ar })}
                  </p>
                </div>
                <Badge className="bg-success">{decision.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {settings?.show_policy_changes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              التغييرات في السياسات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {governanceData.policyChanges.map((policy) => (
              <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{policy.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(policy.date, "dd MMMM yyyy", { locale: ar })}
                  </p>
                </div>
                <Badge variant="secondary">{policy.impact}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {settings?.show_audit_reports && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              تقارير المراجعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {governanceData.auditReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{report.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(report.date, "dd MMMM yyyy", { locale: ar })}
                  </p>
                </div>
                <Badge className="bg-success">{report.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
