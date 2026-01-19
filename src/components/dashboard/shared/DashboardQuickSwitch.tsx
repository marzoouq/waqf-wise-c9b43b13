/**
 * مكون التنقل السريع بين لوحات التحكم
 * يظهر فقط إذا كان للمستخدم أكثر من دور
 * 
 * @version 1.0.0
 */

import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, ChevronDown, Shield, Eye, Calculator, Archive, Wallet, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface DashboardOption {
  role: string;
  path: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const dashboardOptions: DashboardOption[] = [
  { role: "admin", path: "/admin-dashboard", label: "لوحة المشرف", icon: Shield, color: "text-destructive" },
  { role: "nazer", path: "/nazer-dashboard", label: "لوحة الناظر", icon: Eye, color: "text-primary" },
  { role: "accountant", path: "/accountant-dashboard", label: "لوحة المحاسب", icon: Calculator, color: "text-status-success" },
  { role: "archivist", path: "/archivist-dashboard", label: "لوحة أمين الأرشيف", icon: Archive, color: "text-status-warning" },
  { role: "cashier", path: "/cashier-dashboard", label: "لوحة الصراف", icon: Wallet, color: "text-chart-1" },
  { role: "user", path: "/dashboard", label: "لوحة المستخدم", icon: User, color: "text-muted-foreground" },
];

export function DashboardQuickSwitch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roles } = useAuth();

  // جلب اللوحات المتاحة حسب أدوار المستخدم
  const availableDashboards = dashboardOptions.filter(
    (option) => roles?.includes(option.role)
  );

  // إذا كان للمستخدم دور واحد فقط، لا داعي لإظهار المكون
  if (availableDashboards.length <= 1) {
    return null;
  }

  // تحديد اللوحة الحالية
  const currentDashboard = availableDashboards.find(
    (option) => location.pathname.startsWith(option.path)
  ) || availableDashboards[0];

  const CurrentIcon = currentDashboard?.icon || LayoutDashboard;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8">
          <CurrentIcon className={cn("h-4 w-4", currentDashboard?.color)} />
          <span className="hidden sm:inline text-xs">{currentDashboard?.label}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableDashboards.map((dashboard) => {
          const Icon = dashboard.icon;
          const isActive = location.pathname.startsWith(dashboard.path);
          
          return (
            <DropdownMenuItem
              key={dashboard.role}
              onClick={() => navigate(dashboard.path)}
              className={cn(
                "gap-2 cursor-pointer",
                isActive && "bg-muted"
              )}
            >
              <Icon className={cn("h-4 w-4", dashboard.color)} />
              <span>{dashboard.label}</span>
              {isActive && (
                <span className="me-auto text-xs text-muted-foreground">الحالية</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
