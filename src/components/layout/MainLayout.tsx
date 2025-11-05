import { ReactNode } from "react";
import AppSidebar from "./Sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { NotificationsBell } from "./NotificationsBell";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
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
            </header>

            {/* Desktop Toggle */}
            <div className="hidden lg:block sticky top-0 z-30 h-12 border-b bg-background">
              <div className="flex items-center h-full px-4">
                <SidebarTrigger>
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
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
