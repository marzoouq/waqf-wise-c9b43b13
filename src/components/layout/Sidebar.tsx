import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Wallet,
  FileText,
  Calculator,
  BarChart3,
  Settings,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "لوحة التحكم", path: "/" },
    { icon: Users, label: "المستفيدون", path: "/beneficiaries" },
    { icon: Building2, label: "العقارات", path: "/properties" },
    { icon: Wallet, label: "الأموال والمصارف", path: "/funds" },
    { icon: FileText, label: "الأرشيف", path: "/archive" },
    { icon: Calculator, label: "المحاسبة", path: "/accounting" },
    { icon: BarChart3, label: "التقارير", path: "/reports" },
    { icon: Settings, label: "الإعدادات", path: "/settings" },
  ];

  return (
    <aside
      className={cn(
        "fixed right-0 top-0 z-40 h-screen bg-sidebar border-l border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-sidebar-foreground">
                  منصة الوقف
                </h2>
                <p className="text-xs text-sidebar-foreground/60">
                  نظام إدارة متكامل
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent",
              isCollapsed && "justify-center"
            )}
          >
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-sm">ن</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  الناظر
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  admin@waqf.sa
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
