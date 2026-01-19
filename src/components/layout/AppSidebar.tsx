import { useState, useMemo } from "react";
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
  ScrollText,
  Bell,
  Mail,
  ChevronDown,
  DollarSign,
  HandCoins,
  Sparkles,
  Bot,
  ScanSearch,
  Vote,
  MessageSquare,
  Headphones,
  BookOpen,
  Activity,
  Calendar,
  Store,
  HeartHandshake,
  MoreHorizontal,
  TrendingUp,
  Building,
  FileCheck,
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
import { useUserRole } from "@/hooks/auth/useUserRole";

// القائمة المبسطة - الأقسام الأكثر استخداماً (تظهر دائماً)
const primaryMenuItems = [
  {
    id: "dashboard",
    label: "لوحة التحكم",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["all"],
  },
  {
    id: "pos",
    label: "نقطة البيع",
    icon: Store,
    path: "/pos",
    roles: ["nazer", "accountant", "cashier"],
  },
  {
    id: "properties",
    label: "العقارات",
    icon: Building2,
    path: "/properties",
    roles: ["admin", "accountant", "nazer"],
  },
  {
    id: "tenants",
    label: "المستأجرون",
    icon: Users,
    path: "/tenants",
    roles: ["admin", "accountant", "nazer", "cashier"],
  },
  {
    id: "beneficiaries",
    label: "المستفيدون",
    icon: UsersRound,
    path: "/beneficiaries",
    roles: ["admin", "accountant", "nazer"],
  },
  {
    id: "payments",
    label: "المدفوعات",
    icon: CreditCard,
    path: "/payments",
    roles: ["admin", "accountant", "cashier", "nazer"],
  },
  {
    id: "reports",
    label: "التقارير",
    icon: BarChart3,
    path: "/reports",
    roles: ["admin", "accountant", "nazer"],
  },
];

// القائمة الموسعة - تظهر عند الضغط على "المزيد"
const moreMenuGroups = [
  {
    id: "waqf",
    label: "الوقف والأموال",
    icon: Wallet,
    roles: ["admin", "accountant", "nazer"],
    subItems: [
      { icon: Building2, label: "أقلام الوقف", path: "/waqf-units" },
      { icon: Wallet, label: "الأموال والتوزيعات", path: "/funds" },
      { icon: HandCoins, label: "القروض", path: "/loans" },
    ]
  },
  {
    id: "accounting",
    label: "المحاسبة",
    icon: Calculator,
    roles: ["admin", "accountant", "nazer"],
    subItems: [
      { icon: Calculator, label: "المحاسبة", path: "/accounting" },
      { icon: Calendar, label: "السنوات المالية", path: "/fiscal-years" },
      { icon: TrendingUp, label: "الميزانيات", path: "/budgets" },
      { icon: FileText, label: "سندات الدفع", path: "/payment-vouchers" },
      { icon: Receipt, label: "الفواتير", path: "/invoices" },
      { icon: Building2, label: "التحويلات البنكية", path: "/bank-transfers" },
      { icon: DollarSign, label: "جميع المعاملات", path: "/all-transactions" },
      { icon: CheckSquare, label: "الموافقات", path: "/approvals" },
    ]
  },
  {
    id: "beneficiaries-more",
    label: "المستفيدين",
    icon: Users,
    roles: ["admin", "accountant", "nazer"],
    subItems: [
      { icon: UsersRound, label: "العائلات", path: "/families" },
      { icon: ClipboardList, label: "الطلبات", path: "/requests" },
      { icon: HeartHandshake, label: "المساعدات الطارئة", path: "/emergency-aid" },
    ]
  },
  {
    id: "archive",
    label: "الأرشيف والحوكمة",
    icon: Archive,
    roles: ["admin", "nazer", "archivist", "waqf_heir"],
    subItems: [
      { icon: Archive, label: "الأرشيف", path: "/archive" },
      { icon: Building, label: "مجالس الحوكمة", path: "/governance/boards" },
      { icon: FileCheck, label: "السياسات", path: "/governance/policies" },
      { icon: Vote, label: "القرارات والتصويت", path: "/governance/decisions" },
      { icon: ScrollText, label: "الدليل الإرشادي", path: "/governance/guide" },
    ]
  },
  {
    id: "ai",
    label: "الذكاء الاصطناعي",
    icon: Sparkles,
    roles: ["admin", "nazer"],
    subItems: [
      { icon: Bot, label: "المساعد الذكي", path: "/chatbot" },
      { icon: Sparkles, label: "الرؤى الذكية", path: "/ai-insights" },
      { icon: ScanSearch, label: "الفحص الذكي", path: "/ai-audit" },
    ]
  },
  {
    id: "support",
    label: "الدعم والمساعدة",
    icon: Headphones,
    roles: ["all"],
    subItems: [
      { icon: Mail, label: "الرسائل", path: "/messages" },
      { icon: MessageSquare, label: "تذاكر الدعم", path: "/support" },
      { icon: BookOpen, label: "قاعدة المعرفة", path: "/knowledge-base" },
    ]
  },
  {
    id: "system",
    label: "إدارة النظام",
    icon: Settings,
    roles: ["admin", "nazer"],
    subItems: [
      { icon: Shield, label: "المستخدمون", path: "/users" },
      { icon: Bell, label: "الإشعارات", path: "/notifications" },
      { icon: Activity, label: "لوحة المراقبة", path: "/system-monitoring" },
      { icon: Settings, label: "الإعدادات", path: "/settings" },
    ]
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const { state, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [showMore, setShowMore] = useState(false);
  const { 
    hasRole,
    roles,
    isLoading: roleLoading 
  } = useUserRole();

  // تصفية القوائم الأساسية حسب صلاحيات المستخدم
  const filteredPrimaryItems = useMemo(() => {
    if (roleLoading) {
      return primaryMenuItems.filter(item => item.roles.includes('all'));
    }

    return primaryMenuItems.filter(item => 
      item.roles.includes('all') || 
      item.roles.some(role => hasRole(role as 'admin' | 'accountant' | 'archivist' | 'cashier' | 'beneficiary' | 'waqf_heir' | 'nazer'))
    );
  }, [roles, roleLoading, hasRole]);

  // تصفية القوائم الموسعة حسب صلاحيات المستخدم
  const filteredMoreGroups = useMemo(() => {
    if (roleLoading) return [];

    return moreMenuGroups.filter(group => 
      group.roles.includes('all') || 
      group.roles.some(role => hasRole(role as 'admin' | 'accountant' | 'archivist' | 'cashier' | 'beneficiary' | 'waqf_heir' | 'nazer'))
    );
  }, [roles, roleLoading, hasRole]);

  return (
    <Sidebar collapsible="icon" side="right" aria-label="القائمة الرئيسية">
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
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* القائمة الأساسية - الأكثر استخداماً */}
        <SidebarGroup>
          <SidebarGroupLabel>الأقسام الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredPrimaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <NavLink 
                        to={item.path}
                        onClick={() => setOpenMobile(false)}
                      >
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

        {/* زر المزيد */}
        {filteredMoreGroups.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible 
                  open={showMore} 
                  onOpenChange={setShowMore}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip="المزيد من الأقسام">
                        <MoreHorizontal className="h-5 w-5" />
                        <span>المزيد</span>
                        <ChevronDown className="me-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="mt-2 space-y-2">
                        {filteredMoreGroups.map((group) => {
                          const GroupIcon = group.icon;
                          
                          return (
                            <Collapsible key={group.id} className="group/sub-collapsible">
                              <CollapsibleTrigger asChild>
                                <SidebarMenuSubButton className="w-full justify-between cursor-pointer hover:bg-sidebar-accent">
                                  <div className="flex items-center gap-2">
                                    <GroupIcon className="h-4 w-4" />
                                    <span>{group.label}</span>
                                  </div>
                                  <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]/sub-collapsible:rotate-180" />
                                </SidebarMenuSubButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="ms-4 mt-1 space-y-1 border-r border-sidebar-border pr-2">
                                  {group.subItems.map((subItem, index) => {
                                    const SubIcon = subItem.icon;
                                    const isSubActive = location.pathname === subItem.path;
                                    
                                    return (
                                      <SidebarMenuSubItem key={`${subItem.path}-${index}`}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={isSubActive}
                                        >
                                          <NavLink 
                                            to={subItem.path}
                                            onClick={() => setOpenMobile(false)}
                                          >
                                            <SubIcon className="h-3 w-3" />
                                            <span className="text-xs">{subItem.label}</span>
                                          </NavLink>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    );
                                  })}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
