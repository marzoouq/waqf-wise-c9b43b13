/**
 * Archivist Bottom Navigation Configuration
 * شريط التنقل السفلي للأرشيفي
 * @version 1.0.0
 */

import { Home, FolderOpen, FileText, Search, MoreHorizontal } from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const archivistNavigationItems: readonly NavigationItem[] = [
  {
    id: "home",
    label: "الرئيسية",
    icon: Home,
    path: "/archivist-dashboard",
    matchPaths: ["/archivist-dashboard"],
  },
  {
    id: "archive",
    label: "الأرشيف",
    icon: FolderOpen,
    path: "/archive",
    matchPaths: ["/archive", "/folders"],
  },
  {
    id: "documents",
    label: "المستندات",
    icon: FileText,
    path: "/documents",
    matchPaths: ["/documents"],
  },
  {
    id: "search",
    label: "بحث",
    icon: Search,
    path: "/archive?search=true",
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
