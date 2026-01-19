/**
 * Cashier Bottom Navigation Configuration
 * شريط التنقل السفلي للصراف
 * @version 1.0.0
 */

import { Home, Wallet, Receipt, Clock, MoreHorizontal } from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const cashierNavigationItems: readonly NavigationItem[] = [
  {
    id: "home",
    label: "الرئيسية",
    icon: Home,
    path: "/pos",
    matchPaths: ["/pos", "/cashier-dashboard"],
  },
  {
    id: "collect",
    label: "تحصيل",
    icon: Wallet,
    path: "/pos?action=collect",
    matchPaths: [],
  },
  {
    id: "receipts",
    label: "الإيصالات",
    icon: Receipt,
    path: "/pos?tab=receipts",
    matchPaths: [],
  },
  {
    id: "shift",
    label: "الوردية",
    icon: Clock,
    path: "/pos?tab=shift",
    matchPaths: [],
  },
  {
    id: "more",
    label: "المزيد",
    icon: MoreHorizontal,
    path: "/settings",
    matchPaths: ["/settings"],
  },
] as const;
