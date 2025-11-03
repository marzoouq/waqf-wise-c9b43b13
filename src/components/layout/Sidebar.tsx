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

const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
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
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">و</span>
            </div>
          </div>
        )}
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

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
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
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
