/**
 * قسم التقارير السريعة للناظر
 * وصول سريع لجميع التقارير المالية والإدارية
 * 
 * @version 2.8.91 - استخدام CSS Variables
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  FileText, FileBarChart, 
  Building2, Users, Wallet, DollarSign,
  ChevronLeft, Download, Printer, Calendar
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
    title: "التقارير المالية",
    icon: DollarSign,
    color: "text-[hsl(var(--status-success))]",
    bgColor: "bg-[hsl(var(--status-success)/0.1)]",
    reports: [
      { label: "ميزان المراجعة", path: "/accounting?tab=trial-balance" },
      { label: "قائمة الدخل", path: "/accounting?tab=income-statement" },
      { label: "الميزانية العمومية", path: "/accounting?tab=balance-sheet" },
      { label: "التدفقات النقدية", path: "/accounting?tab=cash-flow" },
      { label: "دفتر الأستاذ", path: "/accounting?tab=ledger" },
    ],
  },
  {
    title: "تقارير العقارات",
    icon: Building2,
    color: "text-[hsl(var(--status-warning))]",
    bgColor: "bg-[hsl(var(--status-warning)/0.1)]",
    reports: [
      { label: "أداء العقارات", path: "/properties" },
      { label: "الإيجارات والتحصيل", path: "/invoices" },
      { label: "العقود والمستأجرين", path: "/tenants" },
      { label: "تقرير أعمار الديون", path: "/tenants/aging-report" },
    ],
  },
  {
    title: "تقارير المستفيدين",
    icon: Users,
    color: "text-[hsl(var(--chart-1))]",
    bgColor: "bg-[hsl(var(--chart-1)/0.1)]",
    reports: [
      { label: "إحصائيات المستفيدين", path: "/beneficiaries" },
      { label: "التوزيعات السنوية", path: "/fiscal-years" },
      { label: "العائلات والورثة", path: "/families" },
      { label: "تاريخ المدفوعات", path: "/payments" },
    ],
  },
  {
    title: "القروض والفزعات",
    icon: Wallet,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    reports: [
      { label: "القروض النشطة", path: "/loans", badge: "مهم" },
      { label: "الفزعات الطارئة", path: "/emergency-aid" },
      { label: "سندات الصرف", path: "/payment-vouchers" },
      { label: "الموافقات", path: "/approvals" },
    ],
  },
  {
    title: "التقارير التنفيذية",
    icon: FileBarChart,
    color: "text-[hsl(var(--chart-5))]",
    bgColor: "bg-[hsl(var(--chart-5)/0.1)]",
    reports: [
      { label: "التقارير الشاملة", path: "/reports" },
      { label: "تقرير الحوكمة", path: "/governance/guide" },
      { label: "قرارات الحوكمة", path: "/governance/decisions" },
      { label: "التقارير المخصصة", path: "/reports/custom" },
    ],
  },
];

export function NazerReportsSection() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>التقارير والإحصائيات</CardTitle>
          </div>
          <Button onClick={() => navigate("/reports")} variant="ghost" size="sm" className="gap-1">
            جميع التقارير
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>وصول سريع لجميع التقارير المالية والإدارية</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير شامل
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            طباعة ملخص
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            تقرير الفترة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
