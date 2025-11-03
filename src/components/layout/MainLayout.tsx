import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Sidebar />
      <main className={cn("mr-64 transition-all duration-300")}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
