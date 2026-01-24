/**
 * Beneficiary Bottom Navigation Configuration
 * شريط التنقل السفلي للمستفيد
 * @version 3.0.0 - إعادة تنظيم التبويبات
 */

import { Home, Wallet, FileText, Users, MoreHorizontal } from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const beneficiaryNavigationItems: readonly NavigationItem[] = [
  {
    id: "home",
    label: "الرئيسية",
    icon: Home,
    path: "/beneficiary-portal",
    matchPaths: [], // فارغ - المنطق الجديد في BottomNavigation يتعامل مع الرئيسية
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
    id: "family",
    label: "العائلة",
    icon: Users,
    path: "/beneficiary-portal?tab=family-account",
    matchPaths: [
      "/beneficiary-portal?tab=family-account", 
      "/beneficiary-portal?tab=profile",
      "/beneficiary-portal?tab=family",
      "/beneficiary-portal?tab=bank"
    ],
  },
  {
    id: "more",
    label: "المزيد",
    icon: MoreHorizontal,
    path: "/beneficiary-portal?tab=more",
    matchPaths: [
      "/beneficiary-portal?tab=more",
      "/beneficiary-portal?tab=reports-detail",
      "/beneficiary-portal?tab=properties",
      "/beneficiary-portal?tab=documents",
      "/beneficiary-portal?tab=governance",
      "/beneficiary-portal?tab=loans",
      "/beneficiary-settings", 
      "/beneficiary-support"
    ],
  },
] as const;
