/**
 * قسم التقارير السريعة للناظر
 * وصول سريع لجميع التقارير المالية والإدارية
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  FileText, FileBarChart, PieChart, TrendingUp, 
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
    color: "text-green-600",
    bgColor: "bg-green-100",
    reports: [
      { label: "ميزان المراجعة", path: "/accounting/trial-balance" },
      { label: "قائمة الدخل", path: "/accounting/income-statement" },
      { label: "الميزانية العمومية", path: "/accounting/balance-sheet" },
      { label: "التدفقات النقدية", path: "/reports/cash-flow" },
      { label: "دفتر الأستاذ", path: "/accounting/ledger" },
    ],
  },
  {
    title: "تقارير العقارات",
    icon: Building2,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    reports: [
      { label: "أداء العقارات", path: "/reports/properties" },
      { label: "الإيجارات والتحصيل", path: "/properties/rentals" },
      { label: "العقود والمستأجرين", path: "/properties/contracts" },
      { label: "تكاليف الصيانة", path: "/properties/maintenance" },
    ],
  },
  {
    title: "تقارير المستفيدين",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    reports: [
      { label: "إحصائيات المستفيدين", path: "/reports/beneficiaries" },
      { label: "التوزيعات السنوية", path: "/reports/distributions" },
      { label: "تقرير الورثة", path: "/reports/heirs" },
      { label: "تاريخ المدفوعات", path: "/payments" },
    ],
  },
  {
    title: "القروض والفزعات",
    icon: Wallet,
    color: "text-red-600",
    bgColor: "bg-red-100",
    reports: [
      { label: "القروض النشطة", path: "/loans", badge: "مهم" },
      { label: "أعمار الديون", path: "/loans/aging" },
      { label: "الفزعات الطارئة", path: "/emergency-aid" },
      { label: "جداول السداد", path: "/loans/schedule" },
    ],
  },
  {
    title: "التقارير التنفيذية",
    icon: FileBarChart,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    reports: [
      { label: "الإفصاح السنوي", path: "/disclosures" },
      { label: "تقرير الحوكمة", path: "/governance" },
      { label: "مؤشرات الأداء", path: "/reports/kpi" },
      { label: "التحليل التفاعلي", path: "/reports/interactive" },
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
                    <FileText className="h-3 w-3 ml-2 text-muted-foreground" />
                    {report.label}
                    {report.badge && (
                      <Badge variant="destructive" className="mr-auto text-[10px] h-4 px-1">
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
