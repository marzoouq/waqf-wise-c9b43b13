/**
 * Beneficiary Sidebar Configuration
 * بيانات ثابتة للقائمة الجانبية
 * @version 2.9.25 - تحديث الأيقونات لتجنب التكرار
 */

import {
  LayoutDashboard,
  User,
  FileEdit,
  PieChart,
  Receipt,
  Building2,
  FolderOpen,
  Users,
  Wallet,
  Landmark,
  FileBarChart,
  Scale,
  BarChart3,
  CreditCard,
  ClipboardCheck,
  BarChart2,
  HelpCircle,
} from "lucide-react";

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  tab?: string;
  visibilityKey?: string;
}

export const sidebarItems: SidebarItem[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard, tab: "overview", visibilityKey: "show_overview" },
  { id: "profile", label: "الملف الشخصي", icon: User, tab: "profile", visibilityKey: "show_profile" },
  { id: "requests", label: "الطلبات", icon: FileEdit, tab: "requests", visibilityKey: "show_requests" },
  { id: "distributions", label: "التوزيعات", icon: PieChart, tab: "distributions", visibilityKey: "show_distributions" },
  { id: "statements", label: "كشف الحساب", icon: Receipt, tab: "statements", visibilityKey: "show_statements" },
  { id: "properties", label: "العقارات", icon: Building2, tab: "properties", visibilityKey: "show_properties" },
  { id: "documents", label: "المستندات", icon: FolderOpen, tab: "documents", visibilityKey: "show_documents" },
  { id: "family", label: "العائلة", icon: Users, tab: "family", visibilityKey: "show_family_tree" },
  { id: "bank", label: "الحسابات البنكية", icon: Wallet, tab: "bank", visibilityKey: "show_bank_accounts" },
  { id: "waqf", label: "الوقف", icon: Landmark, tab: "waqf" },
  { id: "disclosures", label: "الإفصاحات", icon: FileBarChart, tab: "disclosures", visibilityKey: "show_disclosures" },
  { id: "governance", label: "الحوكمة", icon: Scale, tab: "governance", visibilityKey: "show_governance" },
  { id: "budgets", label: "الميزانيات", icon: BarChart3, tab: "budgets", visibilityKey: "show_budgets" },
  { id: "loans", label: "القروض", icon: CreditCard, tab: "loans", visibilityKey: "show_own_loans" },
  { id: "approvals", label: "سجل الموافقات", icon: ClipboardCheck, tab: "approvals", visibilityKey: "show_approvals_log" },
  { id: "reports", label: "التقارير", icon: BarChart2, tab: "reports", visibilityKey: "show_financial_reports" },
  { id: "support", label: "الدعم الفني", icon: HelpCircle, href: "/beneficiary-support" },
];
