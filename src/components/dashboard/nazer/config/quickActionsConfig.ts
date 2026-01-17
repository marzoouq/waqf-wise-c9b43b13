import {
  CheckCircle,
  FileText,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  PieChart,
  Settings,
  Shield,
  LucideIcon,
} from "lucide-react";

export interface QuickAction {
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  path: string;
}

export const NAZER_QUICK_ACTIONS: QuickAction[] = [
  {
    icon: CheckCircle,
    label: "اعتماد الموافقات",
    description: "مراجعة واعتماد الموافقات المعلقة",
    color: "text-primary",
    bgColor: "bg-primary/10",
    path: "/approvals",
  },
  {
    icon: TrendingUp,
    label: "محاكاة التوزيع",
    description: "معاينة توزيع الغلة قبل الاعتماد",
    color: "text-primary",
    bgColor: "bg-primary/10",
    path: "/funds",
  },
  {
    icon: FileText,
    label: "التقارير التنفيذية",
    description: "عرض التقارير والإحصائيات",
    color: "text-primary",
    bgColor: "bg-primary/10",
    path: "/reports",
  },
  {
    icon: Users,
    label: "إدارة المستفيدين",
    description: "عرض وإدارة المستفيدين",
    color: "text-primary",
    bgColor: "bg-primary/10",
    path: "/beneficiaries",
  },
  {
    icon: Building2,
    label: "إدارة العقارات",
    description: "متابعة العقارات والعقود",
    color: "text-primary",
    bgColor: "bg-primary/10",
    path: "/properties",
  },
  {
    icon: DollarSign,
    label: "القروض والفزعات",
    description: "متابعة القروض والسلف",
    color: "text-primary",
    bgColor: "bg-primary/10",
    path: "/loans",
  },
  {
    icon: PieChart,
    label: "المحاسبة",
    description: "القيود المالية والتقارير",
    color: "text-primary",
    bgColor: "bg-primary/10",
    path: "/accounting",
  },
  {
    icon: Shield,
    label: "سجلات التدقيق",
    description: "مراقبة جميع العمليات والتغييرات",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    path: "/audit-logs",
  },
  {
    icon: Settings,
    label: "الإعدادات",
    description: "إعدادات النظام والمستخدمين",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    path: "/settings",
  },
];
