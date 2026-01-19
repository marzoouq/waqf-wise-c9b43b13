/**
 * Nazer Bottom Navigation Configuration
 * شريط التنقل السفلي للناظر
 * @version 1.0.0
 */

import { Home, CheckCircle, Users, FileBarChart, MoreHorizontal } from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const nazerNavigationItems: readonly NavigationItem[] = [
  {
    id: "home",
    label: "الرئيسية",
    icon: Home,
    path: "/nazer-dashboard",
    matchPaths: ["/nazer-dashboard"],
  },
  {
    id: "approvals",
    label: "الموافقات",
    icon: CheckCircle,
    path: "/approvals",
    matchPaths: ["/approvals"],
  },
  {
    id: "beneficiaries",
    label: "المستفيدون",
    icon: Users,
    path: "/beneficiaries",
    matchPaths: ["/beneficiaries", "/beneficiary-profile"],
  },
  {
    id: "reports",
    label: "التقارير",
    icon: FileBarChart,
    path: "/reports",
    matchPaths: ["/reports"],
  },
  {
    id: "more",
    label: "المزيد",
    icon: MoreHorizontal,
    path: "/settings",
    matchPaths: ["/settings", "/governance-decisions"],
  },
] as const;
