/**
 * Beneficiary Bottom Navigation Configuration
 * بيانات ثابتة لشريط التنقل السفلي - محسّنة للمستفيد
 * @version 2.0.0
 */

import { Home, Wallet, FileText, User, MoreHorizontal } from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  matchPaths?: string[];
  badge?: number;
}

export const beneficiaryNavigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "الرئيسية",
    icon: Home,
    path: "/beneficiary-portal",
    matchPaths: ["/beneficiary-portal"],
  },
  {
    id: "distributions",
    label: "التوزيعات",
    icon: Wallet,
    path: "/beneficiary-portal?tab=distributions",
    matchPaths: ["/beneficiary-portal?tab=distributions"],
  },
  {
    id: "requests",
    label: "الطلبات",
    icon: FileText,
    path: "/beneficiary-portal?tab=requests",
    matchPaths: ["/beneficiary-portal?tab=requests", "/beneficiary/requests"],
  },
  {
    id: "profile",
    label: "ملفي",
    icon: User,
    path: "/beneficiary-portal?tab=profile",
    matchPaths: ["/beneficiary-portal?tab=profile"],
  },
  {
    id: "more",
    label: "المزيد",
    icon: MoreHorizontal,
    path: "/beneficiary-portal?tab=reports",
    matchPaths: ["/beneficiary-portal?tab=reports", "/beneficiary-settings", "/beneficiary-support"],
  },
];
