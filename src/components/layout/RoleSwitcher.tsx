import { memo, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Shield, User, Calculator, Wallet, Archive, Users, LucideIcon } from "lucide-react";
import { ROLE_LABELS } from "@/types/roles";

const roleRoutes: Record<string, string> = {
  nazer: "/nazer-dashboard",
  admin: "/admin-dashboard",
  accountant: "/accountant-dashboard",
  cashier: "/cashier-dashboard",
  archivist: "/archivist-dashboard",
  waqf_heir: "/beneficiary-portal",
  beneficiary: "/beneficiary-portal",
};

const roleIcons: Record<string, LucideIcon> = {
  nazer: Shield,
  admin: Shield,
  accountant: Calculator,
  cashier: Wallet,
  archivist: Archive,
  waqf_heir: Users,
  beneficiary: Users,
};

export const RoleSwitcher = memo(function RoleSwitcher() {
  const { roles, primaryRole } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  // إذا كان لدى المستخدم دور واحد فقط، لا نعرض المبدل
  if (roles.length <= 1) {
    return null;
  }

  const currentRole = useMemo(() => {
    const path = location.pathname;
    for (const [role, route] of Object.entries(roleRoutes)) {
      if (path.startsWith(route)) {
        return role;
      }
    }
    return primaryRole;
  }, [location.pathname, primaryRole]);

  const handleRoleSwitch = useCallback((role: string) => {
    const route = roleRoutes[role];
    if (route && route !== location.pathname) {
      navigate(route);
    }
  }, [location.pathname, navigate]);

  const CurrentIcon = roleIcons[currentRole] || User;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{ROLE_LABELS[currentRole as keyof typeof ROLE_LABELS] || "المستخدم"}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 sm:w-56">
        {roles.map((role) => {
          const Icon = roleIcons[role] || User;
          const isActive = role === currentRole;
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => handleRoleSwitch(role)}
              className={isActive ? "bg-accent" : ""}
            >
              <Icon className="h-4 w-4 ml-2" />
              <span>{ROLE_LABELS[role as keyof typeof ROLE_LABELS]}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
