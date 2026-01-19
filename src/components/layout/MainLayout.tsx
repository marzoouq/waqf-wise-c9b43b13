import { ReactNode, useState, memo, useMemo, useEffect, lazy, Suspense } from "react";
// ⚠️ IMPORTANT: Always import from AppSidebar.tsx (not Sidebar.tsx)
import AppSidebar from "./AppSidebar";
import { GlobalMonitoring } from "@/components/developer/GlobalMonitoring";
import { BackgroundMonitor } from "@/components/developer/BackgroundMonitor";
import { IdleTimeoutManager } from "@/components/auth/IdleTimeoutManager";
import { SessionManager } from "@/components/auth/SessionManager";
import AppVersionFooter from "./AppVersionFooter";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Menu, LogOut, Search } from "lucide-react";
import { NotificationsBell } from "./NotificationsBell";
import { GovernanceGuideButton } from "./GovernanceGuideButton";
import { FloatingChatButton } from "@/components/chatbot/FloatingChatButton";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import { getNavigationByRole, getNavigationAriaLabel } from "@/config/navigation";
import { useUserRole } from "@/hooks/auth/useUserRole";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/auth/useProfile";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAlertCleanup } from "@/hooks/system/useAlertCleanup";
import { useRolePrefetch } from "@/lib/routePrefetch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MainLayoutProps {
  children: ReactNode;
}

// مكون Header للجوال - محسّن ومنفصل
const MobileHeader = memo(function MobileHeader({ 
  onSearchOpen, 
  displayName, 
  displayEmail,
  userInitial,
  onSignOut 
}: { 
  onSearchOpen: () => void;
  displayName: string;
  displayEmail: string;
  userInitial: string;
  onSignOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden" role="banner">
      <SidebarTrigger aria-label="فتح القائمة الجانبية">
        <Menu className="h-6 w-6" aria-hidden="true" />
      </SidebarTrigger>
      <div className="flex-1">
        <h1 className="text-lg font-bold text-gradient-primary">
          منصة الوقف
        </h1>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onSearchOpen}
        className="gap-2"
        aria-label="فتح البحث"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </Button>
      <GovernanceGuideButton />
      <NotificationsBell />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="قائمة المستخدم">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-popover">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{displayEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut} className="text-destructive cursor-pointer">
            <LogOut className="ms-2 h-4 w-4" />
            تسجيل الخروج
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
});

// مكون Header للديسكتوب - محسّن ومنفصل
const DesktopHeader = memo(function DesktopHeader({ 
  onSearchOpen, 
  displayName, 
  displayEmail,
  userInitial,
  onSignOut 
}: { 
  onSearchOpen: () => void;
  displayName: string;
  displayEmail: string;
  userInitial: string;
  onSignOut: () => void;
}) {
  return (
    <div className="hidden lg:block sticky top-0 z-30 h-14 border-b bg-background" role="banner">
      <div className="flex items-center justify-between h-full px-4">
        <SidebarTrigger aria-label="فتح/إغلاق القائمة الجانبية">
          <Menu className="h-5 w-5" aria-hidden="true" />
        </SidebarTrigger>
        
        <div className="flex items-center gap-3">
          <RoleSwitcher />
          <Button
            variant="outline"
            size="sm"
            onClick={onSearchOpen}
            className="gap-2"
            aria-label="فتح البحث السريع (Ctrl+K)"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden md:inline">بحث</span>
            <kbd className="hidden md:inline pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 ms-2" aria-hidden="true">
              <span className="text-xs">Ctrl+K</span>
            </kbd>
          </Button>
          <GovernanceGuideButton />
          <NotificationsBell />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-3" aria-label="قائمة الحساب">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-xs text-muted-foreground">{displayEmail}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-popover">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut} className="text-destructive cursor-pointer">
                <LogOut className="ms-2 h-4 w-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [searchOpen, setSearchOpen] = useState(false);
  const { isBeneficiary, isWaqfHeir, primaryRole } = useUserRole();
  
  // ✅ تنظيف التنبيهات - يعمل فقط للصفحات المحمية
  useAlertCleanup();
  
  // ✅ تحميل مسبق للمسارات بناءً على دور المستخدم
  useRolePrefetch(primaryRole);
  
  // ✅ تحميل كسول للتهيئة الثقيلة بعد التحميل الأولي
  useEffect(() => {
    const loadHeavyModules = async () => {
      // تأخير التحميل حتى يصبح المتصفح فارغاً
      if ('requestIdleCallback' in window) {
        requestIdleCallback(async () => {
          await import('@/lib/errors/tracker');
          await import('@/lib/selfHealing');
        });
      } else {
        // Fallback للمتصفحات القديمة
        setTimeout(async () => {
          await import('@/lib/errors/tracker');
          await import('@/lib/selfHealing');
        }, 2000);
      }
    };
    
    loadHeavyModules();
  }, []);
  
  // حساب القيم مرة واحدة
  const { displayName, displayEmail, userInitial } = useMemo(() => ({
    displayName: profile?.full_name || user?.user_metadata?.full_name || 'مستخدم',
    displayEmail: profile?.email || user?.email || '',
    userInitial: user?.email?.[0]?.toUpperCase() || 'U'
  }), [profile, user]);

  const handleSearchOpen = () => setSearchOpen(true);

  return (
    <div dir="rtl">
      {/* مكونات المراقبة والجلسات - فقط للصفحات المحمية */}
      <GlobalMonitoring />
      <BackgroundMonitor />
      <SessionManager />
      <IdleTimeoutManager />
      
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
          {/* Sidebar - يعرض كـ Sheet على الجوال وثابت على الديسكتوب */}
          <AppSidebar />
          <SidebarInset>
            {/* Mobile Header */}
            <MobileHeader 
              onSearchOpen={handleSearchOpen}
              displayName={displayName}
              displayEmail={displayEmail}
              userInitial={userInitial}
              onSignOut={signOut}
            />

            {/* Desktop Header */}
            <DesktopHeader 
              onSearchOpen={handleSearchOpen}
              displayName={displayName}
              displayEmail={displayEmail}
              userInitial={userInitial}
              onSignOut={signOut}
            />

            {/* Page Content with padding for mobile bottom navigation */}
            <div className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col pb-20 md:pb-0">
              <main className="flex-1">
                {children}
              </main>
              <AppVersionFooter />
            </div>
          </SidebarInset>
        </div>
        
        {/* Floating Chat Button - Outside flex container for proper z-index */}
        <FloatingChatButton />
        
        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <BottomNavigation 
            items={getNavigationByRole(primaryRole)}
            ariaLabel={getNavigationAriaLabel(primaryRole)}
          />
        </div>
        
        {/* Global Search */}
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </SidebarProvider>
    </div>
  );
};

export default MainLayout;
