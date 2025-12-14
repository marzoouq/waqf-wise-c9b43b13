import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";

export function FinancialReportsTab() {
  const { settings } = useVisibilitySettings();

  if (!settings?.show_financial_reports) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          غير مصرح بعرض التقارير المالية
        </CardContent>
      </Card>
    );
  }

  const reportsList = [
    {
      id: "1",
      name: "التقرير المالي الشهري",
      description: "ملخص الإيرادات والمصروفات الشهرية",
      icon: TrendingUp,
    },
    {
      id: "2",
      name: "تقرير التوزيعات",
      description: "تفاصيل توزيعات الغلة على المستفيدين",
      icon: FileText,
    },
    {
      id: "3",
      name: "تقرير العقارات",
      description: "إيرادات ومصروفات العقارات",
      icon: TrendingDown,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>التقارير المالية المتاحة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reportsList.map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {settings?.allow_export_pdf && (
                    <>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 ml-2" />
                        عرض
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 ml-2" />
                        PDF
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
