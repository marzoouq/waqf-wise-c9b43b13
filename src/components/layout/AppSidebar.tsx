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
  UsersRound,
  ClipboardList,
  Shield,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { NotificationsBell } from "./NotificationsBell";
import { useUserRole } from "@/hooks/useUserRole";
import { useMemo } from "react";

const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { 
    isAdmin, 
    isAccountant, 
    isBeneficiary, 
    isNazer, 
    isCashier, 
    isArchivist,
    isLoading: roleLoading 
  } = useUserRole();

  const allMenuItems = [
    { icon: LayoutDashboard, label: "لوحة التحكم", path: "/", roles: ['all'] },
    { icon: Shield, label: "إدارة المستخدمين", path: "/users", roles: ['admin', 'nazer'] },
    { icon: Users, label: "المستفيدون", path: "/beneficiaries", roles: ['admin', 'accountant', 'nazer'] },
    { icon: UsersRound, label: "العائلات", path: "/families", roles: ['admin', 'accountant', 'nazer'] },
    { icon: ClipboardList, label: "الطلبات", path: "/requests", roles: ['admin', 'accountant', 'nazer'] },
    { icon: Building2, label: "العقارات", path: "/properties", roles: ['admin', 'accountant', 'nazer'] },
    { icon: Wallet, label: "الأموال والمصارف", path: "/funds", roles: ['admin', 'accountant', 'nazer'] },
    { icon: FileText, label: "الأرشيف", path: "/archive", roles: ['admin', 'archivist', 'nazer'] },
    { icon: Calculator, label: "المحاسبة", path: "/accounting", roles: ['admin', 'accountant', 'nazer'] },
    { icon: Receipt, label: "الفواتير", path: "/invoices", roles: ['admin', 'accountant', 'nazer'] },
    { icon: CreditCard, label: "المدفوعات", path: "/payments", roles: ['admin', 'accountant', 'cashier', 'nazer'] },
    { icon: CheckSquare, label: "الموافقات", path: "/approvals", roles: ['admin', 'accountant', 'nazer'] },
    { icon: BarChart3, label: "التقارير", path: "/reports", roles: ['all'] },
    { icon: Settings, label: "الإعدادات", path: "/settings", roles: ['all'] },
  ];

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    // Show items with 'all' role during loading
    if (roleLoading) {
      return allMenuItems.filter(item => item.roles.includes('all'));
    }
    
    const filtered = allMenuItems.filter(item => {
      // 'all' means everyone can access
      if (item.roles.includes('all')) return true;
      
      // Check specific roles
      if (isAdmin) return true;
      if (item.roles.some((role: string) => {
        if (role === 'nazer' && isNazer) return true;
        if (role === 'accountant' && isAccountant) return true;
        if (role === 'beneficiary' && isBeneficiary) return true;
        if (role === 'cashier' && isCashier) return true;
        if (role === 'archivist' && isArchivist) return true;
        return false;
      })) return true;
      
      return false;
    });
    
    console.log("Menu filtering:", { 
      isAdmin, isNazer, isAccountant, isCashier, isArchivist, isBeneficiary, 
      totalItems: allMenuItems.length,
      filteredItems: filtered.length,
      filtered: filtered.map(i => i.label)
    });
    
    return filtered;
  }, [isAdmin, isAccountant, isBeneficiary, isNazer, isCashier, isArchivist, roleLoading]);

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

    </Sidebar>
  );
};

export default AppSidebar;
