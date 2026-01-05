/**
 * Beneficiary Sidebar Configuration
 * بيانات ثابتة للقائمة الجانبية - إصدار مُحسّن بدون تكرار
 * @version 3.0.0
 */

import {
  LayoutDashboard,
  User,
  FileEdit,
  PieChart,
  Building2,
  FolderOpen,
  Users,
  Wallet,
  FileBarChart,
  Scale,
  CreditCard,
  HelpCircle,
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
 * الأقسام المُدمجة:
 * - "التوزيعات" + "كشف الحساب" = "التوزيعات والأرصدة" (توحيد البيانات المالية للمستفيد)
 * - "الإفصاحات" + "التقارير" = "التقارير والإفصاحات" (توحيد التقارير المالية)
 * - "الوقف" تم دمجها مع "نظرة عامة" (لأنها تعرض نفس الملخص)
 * - "الميزانيات" + "سجل الموافقات" = ضمن "الحوكمة" (لأنها تخص الإدارة)
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
    id: "profile", 
    label: "الملف الشخصي", 
    icon: User, 
    tab: "profile", 
    visibilityKey: "show_profile",
    description: "بياناتك الشخصية والبنكية"
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
    id: "distributions", 
    label: "التوزيعات والأرصدة", 
    icon: PieChart, 
    tab: "distributions", 
    visibilityKey: "show_distributions",
    description: "توزيعاتك وكشف الحساب"
  },
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
    id: "family", 
    label: "العائلة", 
    icon: Users, 
    tab: "family", 
    visibilityKey: "show_family_tree",
    description: "شجرة العائلة والورثة"
  },
  { 
    id: "bank", 
    label: "الحسابات البنكية", 
    icon: Wallet, 
    tab: "bank", 
    visibilityKey: "show_bank_accounts",
    description: "حساباتك البنكية"
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
