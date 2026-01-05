/**
 * Beneficiary Sidebar Configuration
 * بيانات ثابتة للقائمة الجانبية
 */

import {
  TrendingUp,
  User,
  CreditCard,
  Building2,
  Users,
  Landmark,
  Shield,
  DollarSign,
  MessageSquare,
  HelpCircle,
  BarChart3,
  FileText,
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
  { id: "overview", label: "نظرة عامة", icon: TrendingUp, tab: "overview", visibilityKey: "show_overview" },
  { id: "profile", label: "الملف الشخصي", icon: User, tab: "profile", visibilityKey: "show_profile" },
  { id: "requests", label: "الطلبات", icon: MessageSquare, tab: "requests", visibilityKey: "show_requests" },
  { id: "distributions", label: "التوزيعات", icon: DollarSign, tab: "distributions", visibilityKey: "show_distributions" },
  { id: "statements", label: "كشف الحساب", icon: CreditCard, tab: "statements", visibilityKey: "show_statements" },
  { id: "properties", label: "العقارات", icon: Building2, tab: "properties", visibilityKey: "show_properties" },
  { id: "documents", label: "المستندات", icon: FileText, tab: "documents", visibilityKey: "show_documents" },
  { id: "family", label: "العائلة", icon: Users, tab: "family", visibilityKey: "show_family_tree" },
  { id: "bank", label: "الحسابات البنكية", icon: Landmark, tab: "bank", visibilityKey: "show_bank_accounts" },
  { id: "waqf", label: "الوقف", icon: Landmark, tab: "waqf" },
  { id: "disclosures", label: "الإفصاحات", icon: FileText, tab: "disclosures", visibilityKey: "show_disclosures" },
  { id: "governance", label: "الحوكمة", icon: Shield, tab: "governance", visibilityKey: "show_governance" },
  { id: "budgets", label: "الميزانيات", icon: DollarSign, tab: "budgets", visibilityKey: "show_budgets" },
  { id: "loans", label: "القروض", icon: CreditCard, tab: "loans", visibilityKey: "show_own_loans" },
  { id: "approvals", label: "سجل الموافقات", icon: Shield, tab: "approvals", visibilityKey: "show_approvals_log" },
  { id: "reports", label: "التقارير", icon: BarChart3, tab: "reports", visibilityKey: "show_financial_reports" },
  { id: "support", label: "الدعم الفني", icon: HelpCircle, href: "/beneficiary-support" },
];
