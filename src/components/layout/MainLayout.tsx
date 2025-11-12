import { ReactNode } from "react";
import AppSidebar from "./Sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Menu, LogOut } from "lucide-react";
import { NotificationsBell } from "./NotificationsBell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
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

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, signOut } = useAuth();

  return (
    <div dir="rtl">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            {/* Mobile Header */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
              <SidebarTrigger>
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gradient-primary">
                  منصة الوقف
                </h1>
              </div>
              <NotificationsBell />
              
              {/* User Menu - Mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-popover">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.user_metadata?.full_name || 'مستخدم'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>

            {/* Desktop Header */}
            <div className="hidden lg:block sticky top-0 z-30 h-14 border-b bg-background">
              <div className="flex items-center justify-between h-full px-4">
                <SidebarTrigger>
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                
                {/* User Menu - Desktop */}
                <div className="flex items-center gap-3">
                  <NotificationsBell />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2 px-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">{user?.user_metadata?.full_name || 'مستخدم'}</span>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 bg-popover">
                      <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                        <LogOut className="ml-2 h-4 w-4" />
                        تسجيل الخروج
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default MainLayout;
