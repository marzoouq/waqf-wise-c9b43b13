/**
 * Beneficiary Bottom Navigation Configuration
 * بيانات ثابتة لشريط التنقل السفلي
 */

import { Home, FileText, Bell, Settings } from "lucide-react";

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
