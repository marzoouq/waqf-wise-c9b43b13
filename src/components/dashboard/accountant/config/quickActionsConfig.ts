/**
 * Quick Actions Config for Accountant Dashboard
 * تكوين الإجراءات السريعة للوحة المحاسب
 */

import { FileText, FileCheck, AlertCircle, DollarSign, LucideIcon } from "lucide-react";

export interface QuickAction {
  icon: LucideIcon;
  label: string;
  path: string;
}

export const ACCOUNTANT_QUICK_ACTIONS: QuickAction[] = [
  {
    icon: FileText,
    label: "قيد جديد",
    path: "/accounting",
  },
  {
    icon: FileCheck,
    label: "التقارير",
    path: "/reports",
  },
  {
    icon: AlertCircle,
    label: "الموافقات",
    path: "/approvals",
  },
  {
    icon: DollarSign,
    label: "الحسابات",
    path: "/accounting",
  },
];
