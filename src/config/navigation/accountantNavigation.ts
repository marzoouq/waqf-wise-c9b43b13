/**
 * Accountant Bottom Navigation Configuration
 * شريط التنقل السفلي للمحاسب
 * @version 1.0.0
 */

import { Home, Calculator, Receipt, FileBarChart, MoreHorizontal } from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const accountantNavigationItems: readonly NavigationItem[] = [
  {
    id: "home",
    label: "الرئيسية",
    icon: Home,
    path: "/accountant-dashboard",
    matchPaths: ["/accountant-dashboard"],
  },
  {
    id: "accounting",
    label: "القيود",
    icon: Calculator,
    path: "/accounting",
    matchPaths: ["/accounting", "/journal-entries"],
  },
  {
    id: "vouchers",
    label: "السندات",
    icon: Receipt,
    path: "/payment-vouchers",
    matchPaths: ["/payment-vouchers", "/invoices"],
  },
  {
    id: "reports",
    label: "التقارير",
    icon: FileBarChart,
    path: "/reports",
    matchPaths: ["/reports", "/financial-reports"],
  },
  {
    id: "more",
    label: "المزيد",
    icon: MoreHorizontal,
    path: "/settings",
    matchPaths: ["/settings"],
  },
] as const;
