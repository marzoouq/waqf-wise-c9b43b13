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
  Archive,
  Bell,
  FolderOpen,
  ChevronDown,
  DollarSign,
  HandCoins,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NotificationsBell } from "./NotificationsBell";
import { useUserRole } from "@/hooks/useUserRole";
import { useMemo } from "react";

// القائمة المنظمة الجديدة - 6 مجموعات رئيسية
const menuGroups = [
  {
    id: "dashboard",
    label: "لوحة التحكم",
    icon: LayoutDashboard,
    path: "/",
    roles: ["all"],
    subItems: []
  },
  {
    id: "waqf",
    label: "إدارة الوقف",
    icon: Users,
    roles: ["admin", "accountant", "nazer"],
    subItems: [
      { icon: Users, label: "المستفيدون", path: "/beneficiaries", roles: ["admin", "accountant", "nazer"] },
      { icon: UsersRound, label: "العائلات", path: "/families", roles: ["admin", "accountant", "nazer"] },
      { icon: ClipboardList, label: "الطلبات", path: "/requests", roles: ["admin", "accountant", "nazer"] },
      { icon: Building2, label: "أقلام الوقف", path: "/waqf-units", roles: ["admin", "accountant", "nazer"] },
      { icon: Wallet, label: "الأموال والمصارف", path: "/funds", roles: ["admin", "accountant", "nazer"] },
    ]
  },
  {
    id: "properties",
    label: "العقارات",
    icon: Building2,
    path: "/properties",
    roles: ["admin", "accountant", "nazer"],
    subItems: []
  },
  {
    id: "finance",
    label: "المالية والمحاسبة",
    icon: Calculator,
    roles: ["admin", "accountant", "nazer", "cashier"],
    subItems: [
      { icon: Calculator, label: "المحاسبة", path: "/accounting", roles: ["admin", "accountant", "nazer"] },
      { icon: Receipt, label: "الفواتير", path: "/invoices", roles: ["admin", "accountant", "nazer"] },
      { icon: CreditCard, label: "المدفوعات", path: "/payments", roles: ["admin", "accountant", "cashier", "nazer"] },
      { icon: HandCoins, label: "القروض", path: "/loans", roles: ["admin", "accountant", "nazer"] },
      { icon: CheckSquare, label: "الموافقات", path: "/approvals", roles: ["admin", "accountant", "nazer"] },
    ]
  },
  {
    id: "management",
    label: "الإدارة والتقارير",
    icon: FolderOpen,
    roles: ["admin", "accountant", "nazer", "archivist"],
    subItems: [
      { icon: Archive, label: "الأرشيف", path: "/archive", roles: ["admin", "archivist", "nazer"] },
      { icon: BarChart3, label: "التقارير", path: "/reports", roles: ["all"] },
      { icon: Shield, label: "سجل العمليات", path: "/audit-logs", roles: ["admin", "nazer"] },
    ]
  },
  {
    id: "settings",
    label: "الإعدادات",
    icon: Settings,
    roles: ["all"],
    subItems: [
      { icon: Shield, label: "المستخدمون", path: "/users", roles: ["admin", "nazer"] },
      { icon: Bell, label: "الإشعارات", path: "/notifications", roles: ["all"] },
      { icon: Settings, label: "الإعدادات العامة", path: "/settings", roles: ["all"] },
    ]
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { 
    hasRole,
    roles,
    isLoading: roleLoading 
  } = useUserRole();

  // تصفية القوائم حسب صلاحيات المستخدم
  const filteredMenuGroups = useMemo(() => {
    if (roleLoading) {
      // عرض العناصر الأساسية فقط أثناء التحميل
      return menuGroups.filter(group => group.roles.includes('all'));
    }

    return menuGroups.filter(group => {
      // التحقق من صلاحية الوصول للمجموعة الرئيسية
      const hasGroupAccess = group.roles.includes('all') || 
        group.roles.some(role => hasRole(role as any));

      if (!hasGroupAccess) return false;

      // تصفية العناصر الفرعية
      if (group.subItems && group.subItems.length > 0) {
        const filteredSubItems = group.subItems.filter(subItem => 
          subItem.roles.includes('all') || subItem.roles.some(role => hasRole(role as any))
        );
        // إظهار المجموعة فقط إذا كان هناك عناصر فرعية متاحة
        return filteredSubItems.length > 0;
      }

      return true;
    });
  }, [roles, roleLoading, hasRole]);

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
              {filteredMenuGroups.map((group) => {
                const Icon = group.icon;
                const isActive = group.path && location.pathname === group.path;

                // إذا كانت المجموعة لا تحتوي على عناصر فرعية
                if (!group.subItems || group.subItems.length === 0) {
                  return (
                    <SidebarMenuItem key={group.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={group.label}
                      >
                        <NavLink to={group.path || "#"}>
                          <Icon className="h-5 w-5" />
                          <span>{group.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // إذا كانت المجموعة تحتوي على عناصر فرعية - استخدام Collapsible
                const filteredSubItems = group.subItems.filter(subItem => 
                  subItem.roles.includes('all') || subItem.roles.some(role => hasRole(role as any))
                );

                return (
                  <Collapsible key={group.id} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={group.label}>
                          <Icon className="h-5 w-5" />
                          <span>{group.label}</span>
                          <ChevronDown className="mr-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {filteredSubItems.map((subItem, index) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = location.pathname === subItem.path;
                            
                            return (
                              <SidebarMenuSubItem key={index}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSubActive}
                                >
                                  <NavLink to={subItem.path}>
                                    <SubIcon className="h-4 w-4" />
                                    <span>{subItem.label}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
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
