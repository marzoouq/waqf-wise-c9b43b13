/**
 * قسم التقارير السريعة للمشرف
 * وصول سريع لجميع التقارير الإدارية والأمنية
 * 
 * @version 1.0.0
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  FileText, Shield, Users, Activity, 
  ChevronLeft, Download, Printer, Database
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportCategory {
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  reports: {
    label: string;
    path: string;
    badge?: string;
  }[];
}

const reportCategories: ReportCategory[] = [
  {
    title: "تقارير المستخدمين",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
    reports: [
      { label: "قائمة المستخدمين", path: "/users" },
      { label: "سجل الدخول", path: "/audit-logs?filter=login" },
      { label: "الأدوار والصلاحيات", path: "/settings/roles" },
      { label: "إدارة الصلاحيات", path: "/settings/permissions" },
    ],
  },
  {
    title: "تقارير الأمان",
    icon: Shield,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    reports: [
      { label: "التنبيهات الأمنية", path: "/security", badge: "مهم" },
      { label: "سجلات التدقيق", path: "/audit-logs" },
      { label: "محاولات الدخول", path: "/audit-logs?filter=auth" },
      { label: "الجلسات النشطة", path: "/security?tab=sessions" },
    ],
  },
  {
    title: "تقارير النظام",
    icon: Activity,
    color: "text-[hsl(var(--status-success))]",
    bgColor: "bg-[hsl(var(--status-success)/0.1)]",
    reports: [
      { label: "صحة النظام", path: "/system-monitoring" },
      { label: "أداء قاعدة البيانات", path: "/db-performance" },
      { label: "سجلات الأخطاء", path: "/system-error-logs" },
      { label: "Edge Functions", path: "/edge-monitor" },
    ],
  },
  {
    title: "تقارير البيانات",
    icon: Database,
    color: "text-[hsl(var(--chart-5))]",
    bgColor: "bg-[hsl(var(--chart-5)/0.1)]",
    reports: [
      { label: "النسخ الاحتياطي", path: "/settings?tab=backup" },
      { label: "التقارير الشاملة", path: "/reports" },
      { label: "التقارير المخصصة", path: "/reports/custom" },
    ],
  },
];

export function AdminReportsSection() {
  const navigate = useNavigate();

  const handleExportAll = () => {
    navigate("/reports?action=export");
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const handleSystemReport = () => {
    navigate("/system-monitoring");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>التقارير الإدارية</CardTitle>
          </div>
          <Button onClick={() => navigate("/reports")} variant="ghost" size="sm" className="gap-1">
            جميع التقارير
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>وصول سريع لتقارير النظام والأمان والمستخدمين</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {reportCategories.map((category) => (
            <div 
              key={category.title}
              className="border rounded-lg overflow-hidden"
            >
              <div className={cn("p-3 flex items-center gap-2", category.bgColor)}>
                <category.icon className={cn("h-5 w-5", category.color)} />
                <span className="font-medium text-sm">{category.title}</span>
              </div>
              <div className="p-2 space-y-1">
                {category.reports.map((report) => (
                  <Button
                    key={report.path}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-8 px-2"
                    onClick={() => navigate(report.path)}
                  >
                    <FileText className="h-3 w-3 ms-2 text-muted-foreground" />
                    {report.label}
                    {report.badge && (
                      <Badge variant="destructive" className="me-auto text-[10px] h-4 px-1">
                        {report.badge}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* أزرار التصدير السريع */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleExportAll}
          >
            <Download className="h-4 w-4" />
            تصدير شامل
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handlePrintSummary}
          >
            <Printer className="h-4 w-4" />
            طباعة ملخص
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleSystemReport}
          >
            <Activity className="h-4 w-4" />
            تقرير النظام
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
