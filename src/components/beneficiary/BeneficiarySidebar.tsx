import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { User } from "lucide-react";
import { sidebarItems } from "./config/sidebarConfig";
import { APP_VERSION } from "@/lib/version";
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

interface BeneficiarySidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  beneficiaryName?: string;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

/**
 * القائمة الجانبية للمستفيدين
 * موحدة مع مكونات Sidebar من shadcn/ui
 */
export function BeneficiarySidebar({ 
  activeTab, 
  onTabChange, 
  beneficiaryName,
}: BeneficiarySidebarProps) {
  const navigate = useNavigate();
  const { settings } = useVisibilitySettings();
  const { setOpenMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleItemClick = (tab: string) => {
    onTabChange(tab);
    setOpenMobile(false);
  };

  const handleNavigate = (href: string) => {
    navigate(href);
    setOpenMobile(false);
  };

  // تصفية العناصر حسب إعدادات الشفافية
  const visibleItems = sidebarItems.filter((item) => {
    if (!item.visibilityKey) return true;
    return settings?.[item.visibilityKey as keyof typeof settings] === true;
  });

  return (
    <Sidebar collapsible="icon" side="right" aria-label="قائمة المستفيد">
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-sidebar-accent/30">
        <div className="flex items-center gap-3">
          {!isCollapsed && (
            <>
              <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-sidebar-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate text-sidebar-foreground">
                  {beneficiaryName || "المستفيد"}
                </h3>
                <p className="text-xs text-sidebar-foreground/70">بوابة الوقف</p>
              </div>
            </>
          )}
          {isCollapsed && (
            <div className="flex justify-center w-full">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-4 w-4 text-sidebar-primary" />
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation Items */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive = activeTab === item.tab;
                const Icon = item.icon;

                if (item.href) {
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => handleNavigate(item.href!)}
                        tooltip={item.label}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => item.tab && handleItemClick(item.tab)}
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!isCollapsed && (
          <div className="text-xs text-center text-sidebar-foreground/70">
            <p>منصة إدارة الوقف</p>
            <p className="mt-1">الإصدار {APP_VERSION}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
