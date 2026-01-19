/**
 * Admin Bottom Navigation Configuration
 * شريط التنقل السفلي للمشرف
 * @version 1.0.0
 */

import { Home, Users, Shield, FileText, MoreHorizontal } from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const adminNavigationItems: readonly NavigationItem[] = [
  {
    id: "home",
    label: "الرئيسية",
    icon: Home,
    path: "/admin-dashboard",
    matchPaths: ["/admin-dashboard"],
  },
  {
    id: "users",
    label: "المستخدمون",
    icon: Users,
    path: "/users",
    matchPaths: ["/users", "/roles-management"],
  },
  {
    id: "security",
    label: "الأمان",
    icon: Shield,
    path: "/security-dashboard",
    matchPaths: ["/security-dashboard", "/audit-logs"],
  },
  {
    id: "audit",
    label: "التدقيق",
    icon: FileText,
    path: "/audit-logs",
    matchPaths: ["/audit-logs", "/system-error-logs"],
  },
  {
    id: "more",
    label: "المزيد",
    icon: MoreHorizontal,
    path: "/settings",
    matchPaths: ["/settings"],
  },
] as const;
