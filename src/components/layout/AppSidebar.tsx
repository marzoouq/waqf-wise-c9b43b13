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
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const { isAdmin, isAccountant, isBeneficiary, isLoading: roleLoading } = useUserRole();

  const allMenuItems = [
    { icon: LayoutDashboard, label: "لوحة التحكم", path: "/", roles: ['admin', 'accountant', 'beneficiary', 'user'] },
    { icon: Users, label: "المستفيدون", path: "/beneficiaries", roles: ['admin', 'accountant'] },
    { icon: Building2, label: "العقارات", path: "/properties", roles: ['admin', 'accountant'] },
    { icon: Wallet, label: "الأموال والمصارف", path: "/funds", roles: ['admin', 'accountant'] },
    { icon: FileText, label: "الأرشيف", path: "/archive", roles: ['admin', 'accountant'] },
    { icon: Calculator, label: "المحاسبة", path: "/accounting", roles: ['admin', 'accountant'] },
    { icon: Receipt, label: "الفواتير", path: "/invoices", roles: ['admin', 'accountant'] },
    { icon: CreditCard, label: "المدفوعات", path: "/payments", roles: ['admin', 'accountant', 'beneficiary'] },
    { icon: CheckSquare, label: "الموافقات", path: "/approvals", roles: ['admin', 'accountant'] },
    { icon: BarChart3, label: "التقارير", path: "/reports", roles: ['admin', 'accountant', 'beneficiary'] },
    { icon: Settings, label: "الإعدادات", path: "/settings", roles: ['admin', 'accountant', 'beneficiary', 'user'] },
  ];

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    if (roleLoading) return [];
    
    return allMenuItems.filter(item => {
      if (isAdmin) return true; // Admin sees everything
      if (isAccountant && item.roles.includes('accountant')) return true;
      if (isBeneficiary && item.roles.includes('beneficiary')) return true;
      if (item.roles.includes('user')) return true;
      return false;
    });
  }, [isAdmin, isAccountant, isBeneficiary, roleLoading]);

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
