/**
 * Permissions Overview Card - بطاقة ملخص الأدوار والصلاحيات
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Users, Settings, ExternalLink } from "lucide-react";
import { useRolesOverview } from "@/hooks/security/useRolesOverview";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500",
  nazer: "bg-purple-500",
  accountant: "bg-blue-500",
  cashier: "bg-green-500",
  archivist: "bg-yellow-500",
  user: "bg-gray-500",
  beneficiary: "bg-teal-500",
  waqf_heir: "bg-orange-500",
};

export function PermissionsOverviewCard() {
  const { rolesData, totalUsers, adminCount, isLoading, error } = useRolesOverview();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            ملخص الأدوار والصلاحيات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            ملخص الأدوار والصلاحيات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            حدث خطأ في جلب البيانات
          </div>
        </CardContent>
      </Card>
    );
  }

  // ترتيب الأدوار حسب الأهمية
  const roleOrder = ['admin', 'nazer', 'accountant', 'cashier', 'archivist', 'user', 'beneficiary', 'waqf_heir'];
  const sortedRoles = [...rolesData].sort((a, b) => {
    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          ملخص الأدوار والصلاحيات
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/settings/roles")}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">إدارة الأدوار</span>
        </Button>
      </CardHeader>
      <CardContent>
        {/* إحصائيات عامة */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <div className="text-xs text-muted-foreground">إجمالي المستخدمين</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
            <Shield className="h-8 w-8 text-red-500" />
            <div>
              <div className="text-2xl font-bold text-red-600">{adminCount}</div>
              <div className="text-xs text-muted-foreground">مدراء النظام</div>
            </div>
          </div>
        </div>

        {/* قائمة الأدوار */}
        <div className="space-y-3">
          {sortedRoles.map((role) => {
            const percentage = totalUsers > 0 ? (role.count / totalUsers) * 100 : 0;
            return (
              <div key={role.role} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${ROLE_COLORS[role.role] || 'bg-gray-400'}`} />
                    <span className="text-sm font-medium">{role.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {role.count}
                  </Badge>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>

        {/* رابط لصفحة الصلاحيات */}
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-between text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/settings/permissions")}
          >
            <span>إدارة الصلاحيات التفصيلية</span>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
