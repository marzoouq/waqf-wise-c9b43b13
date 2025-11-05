import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Wallet,
  FileText,
  Calculator,
  BarChart3,
  Settings,
  Receipt,
  CheckSquare,
  CreditCard,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { NotificationsBell } from "./NotificationsBell";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user, signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: "لوحة التحكم", path: "/" },
    { icon: Users, label: "المستفيدون", path: "/beneficiaries" },
    { icon: Building2, label: "العقارات", path: "/properties" },
    { icon: Wallet, label: "الأموال والمصارف", path: "/funds" },
    { icon: FileText, label: "الأرشيف", path: "/archive" },
    { icon: Calculator, label: "المحاسبة", path: "/accounting" },
    { icon: Receipt, label: "الفواتير", path: "/invoices" },
    { icon: CreditCard, label: "المدفوعات", path: "/payments" },
    { icon: CheckSquare, label: "الموافقات", path: "/approvals" },
    { icon: BarChart3, label: "التقارير", path: "/reports" },
    { icon: Settings, label: "الإعدادات", path: "/settings" },
  ];

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-sidebar-accent/30">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="space-y-1 flex-1">
              <h2 className="text-xl font-bold text-sidebar-foreground">
                منصة الوقف
              </h2>
              <p className="text-xs text-sidebar-foreground/80">
                نظام إدارة متكامل
              </p>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center w-full">
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent font-bold text-sm">و</span>
              </div>
            </div>
          )}
          {!isCollapsed && <NotificationsBell />}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <NavLink to={item.path}>
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 bg-sidebar-accent/30 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0 border-2 border-accent/50">
            <span className="text-accent font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user?.user_metadata?.full_name || 'مستخدم'}
              </p>
              <p className="text-xs text-sidebar-foreground/90 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
