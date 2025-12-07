/**
 * Beneficiary Bottom Navigation Configuration
 * بيانات ثابتة لشريط التنقل السفلي
 */

import { Home, User, FileText, Bell, Settings } from "lucide-react";

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
    path: "/beneficiary-dashboard",
    matchPaths: ["/beneficiary-dashboard"],
  },
  {
    id: "portal",
    label: "بوابتي",
    icon: User,
    path: "/beneficiary-dashboard",
    matchPaths: ["/beneficiary-dashboard", "/beneficiary-portal"],
  },
  {
    id: "requests",
    label: "طلباتي",
    icon: FileText,
    path: "/beneficiary/requests",
    matchPaths: ["/beneficiary/requests"],
  },
  {
    id: "notifications",
    label: "الإشعارات",
    icon: Bell,
    path: "/notifications",
  },
  {
    id: "settings",
    label: "الإعدادات",
    icon: Settings,
    path: "/beneficiary-settings",
  },
];
