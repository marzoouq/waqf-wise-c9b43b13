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
  { id: "waqf", label: "الوقف", icon: Landmark, tab: "waqf" },
  { id: "governance", label: "الحوكمة", icon: Shield, tab: "governance", visibilityKey: "show_governance" },
  { id: "budgets", label: "الميزانيات", icon: DollarSign, tab: "budgets", visibilityKey: "show_budgets" },
  { id: "loans", label: "القروض", icon: CreditCard, tab: "loans", visibilityKey: "show_own_loans" },
  { id: "messages", label: "الرسائل", icon: MessageSquare, href: "/messages" },
  { id: "reports", label: "التقارير", icon: BarChart3, href: "/beneficiary/reports", visibilityKey: "show_financial_reports" },
  { id: "support", label: "الدعم الفني", icon: HelpCircle, href: "/beneficiary-support" },
];
