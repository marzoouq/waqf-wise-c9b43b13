/**
 * Beneficiary Sidebar Configuration
 * بيانات ثابتة للقائمة الجانبية - إصدار مُحسّن
 * @version 4.0.0 - إعادة تنظيم التبويبات
 */

import {
  LayoutDashboard,
  Users,
  FileEdit,
  PieChart,
  Building2,
  FolderOpen,
  FileBarChart,
  Scale,
  CreditCard,
  HelpCircle,
  MoreHorizontal,
} from "lucide-react";

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  tab?: string;
  visibilityKey?: string;
  description?: string;
}

/**
 * الأقسام المتاحة للمستفيد:
 * - "العائلة" الآن يشمل: الملف الشخصي + شجرة العائلة + الحسابات البنكية
 * - "المزيد" يوفر قائمة للوصول السريع للأقسام الأخرى
 */
export const sidebarItems: SidebarItem[] = [
  { 
    id: "overview", 
    label: "نظرة عامة", 
    icon: LayoutDashboard, 
    tab: "overview", 
    visibilityKey: "show_overview",
    description: "ملخص الوقف والإحصائيات العامة"
  },
  { 
    id: "distributions", 
    label: "التوزيعات والأرصدة", 
    icon: PieChart, 
    tab: "distributions", 
    visibilityKey: "show_distributions",
    description: "توزيعاتك وكشف الحساب"
  },
  { 
    id: "requests", 
    label: "الطلبات", 
    icon: FileEdit, 
    tab: "requests", 
    visibilityKey: "show_requests",
    description: "طلباتك والمساعدات الطارئة"
  },
  { 
    id: "family-account", 
    label: "العائلة والحساب", 
    icon: Users, 
    tab: "family-account", 
    visibilityKey: "show_profile",
    description: "بياناتك وشجرة العائلة والحسابات البنكية"
  },
  { 
    id: "more", 
    label: "المزيد", 
    icon: MoreHorizontal, 
    tab: "more", 
    description: "خيارات إضافية"
  },
  // الأقسام الفرعية (تظهر من قائمة "المزيد")
  { 
    id: "properties", 
    label: "العقارات", 
    icon: Building2, 
    tab: "properties", 
    visibilityKey: "show_properties",
    description: "عقارات الوقف"
  },
  { 
    id: "documents", 
    label: "المستندات", 
    icon: FolderOpen, 
    tab: "documents", 
    visibilityKey: "show_documents",
    description: "مستنداتك ومرفقاتك"
  },
  { 
    id: "reports", 
    label: "التقارير والإفصاحات", 
    icon: FileBarChart, 
    tab: "reports", 
    visibilityKey: "show_financial_reports",
    description: "التقارير المالية والإفصاحات السنوية"
  },
  { 
    id: "governance", 
    label: "الحوكمة", 
    icon: Scale, 
    tab: "governance", 
    visibilityKey: "show_governance",
    description: "القرارات والميزانيات والموافقات"
  },
  { 
    id: "loans", 
    label: "القروض", 
    icon: CreditCard, 
    tab: "loans", 
    visibilityKey: "show_own_loans",
    description: "قروضك وأقساطك"
  },
  { 
    id: "support", 
    label: "الدعم الفني", 
    icon: HelpCircle, 
    href: "/beneficiary-support",
    description: "تواصل مع الدعم"
  },
];
