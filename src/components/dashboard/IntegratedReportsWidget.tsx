import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, TrendingUp, Users, Building2, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReportLink {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  count?: number;
}

export function IntegratedReportsWidget() {
  const navigate = useNavigate();

  const reports: ReportLink[] = [
    {
      title: "تقرير المستفيدين",
      description: "قائمة شاملة بجميع المستفيدين وأرصدتهم",
      icon: Users,
      path: "/beneficiaries",
    },
    {
      title: "تقرير التوزيعات",
      description: "سجل التوزيعات المالية والموافقات",
      icon: DollarSign,
      path: "/funds?tab=distributions",
    },
    {
      title: "التقارير المالية",
      description: "الميزانية وقائمة الدخل والتدفقات النقدية",
      icon: TrendingUp,
      path: "/accounting?tab=trial-balance",
    },
    {
      title: "تقرير العقارات",
      description: "حالة العقارات والعقود والإيجارات",
      icon: Building2,
      path: "/properties",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              التقارير المتكاملة
            </CardTitle>
            <CardDescription>
              الوصول السريع للتقارير الأساسية
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>
            <Download className="h-4 w-4 ml-2" />
            جميع التقارير
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.path}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(report.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">{report.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
