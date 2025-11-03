import { Download, FileText, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Reports = () => {
  const reportCategories = [
    {
      id: 1,
      title: "التقارير المالية",
      icon: BarChart3,
      reports: [
        "ميزان المراجعة",
        "قائمة المركز المالي",
        "قائمة الدخل",
        "التدفقات النقدية",
      ],
      color: "bg-primary/10 text-primary",
    },
    {
      id: 2,
      title: "تقارير المستفيدين",
      icon: FileText,
      reports: [
        "قائمة المستفيدين",
        "المدفوعات حسب المستفيد",
        "العائلات والأفراد",
        "حالة المستفيدين",
      ],
      color: "bg-success/10 text-success",
    },
    {
      id: 3,
      title: "تقارير العقارات",
      icon: PieChart,
      reports: [
        "العوائد العقارية",
        "نسبة الإشغال",
        "المتأخرات الإيجارية",
        "الصيانة والتطوير",
      ],
      color: "bg-warning/10 text-warning",
    },
    {
      id: 4,
      title: "تقارير الأداء",
      icon: TrendingUp,
      reports: [
        "مؤشرات الأداء الرئيسية",
        "تحليل التوزيعات",
        "كفاءة المصارف",
        "تقارير الحوكمة",
      ],
      color: "bg-accent/10 text-accent",
    },
  ];

  const recentReports = [
    { id: 1, name: "التقرير المالي - Q2 2024", date: "2024-08-15", size: "3.4 MB" },
    { id: 2, name: "قائمة المستفيدين - أغسطس 2024", date: "2024-08-10", size: "1.2 MB" },
    { id: 3, name: "تقرير العوائد العقارية", date: "2024-08-05", size: "2.8 MB" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">
              التقارير والإحصائيات
            </h1>
            <p className="text-muted-foreground mt-1">
              تقارير شاملة عن جميع أنشطة الوقف
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft">
            <FileText className="ml-2 h-5 w-5" />
            إنشاء تقرير مخصص
          </Button>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.reports.map((report, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-right group"
                      >
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {report}
                        </span>
                        <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Reports */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl font-bold">التقارير الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {report.name}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{report.date}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="shadow-soft bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-xl font-bold">إحصائيات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">156</div>
                <div className="text-sm text-muted-foreground">تقرير تم إنشاؤه</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-success mb-2">24</div>
                <div className="text-sm text-muted-foreground">تقرير هذا الشهر</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">89 MB</div>
                <div className="text-sm text-muted-foreground">حجم التقارير</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
