import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  recentUsers: Array<{
    id: string;
    email: string;
    created_at: string;
    last_login_at?: string;
  }>;
}

export function UserManagementSection() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async (): Promise<UserStats> => {
      // جلب المستخدمين من user_roles
      const { data: usersData, error: usersError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      // حساب الإحصائيات
      const uniqueUsers = new Set(usersData?.map(u => u.user_id) || []);
      const adminUsers = usersData?.filter(u => u.role === 'admin') || [];

      // جلب آخر المستخدمين المسجلين
      const { data: authUsers } = await supabase.auth.admin.listUsers();

      const recentUsers = (authUsers?.users || [])
        .slice(0, 5)
        .map(user => ({
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          last_login_at: user.last_sign_in_at,
        }));

      return {
        totalUsers: uniqueUsers.size,
        activeUsers: recentUsers.length,
        adminCount: new Set(adminUsers.map(u => u.user_id)).size,
        recentUsers,
      };
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            إدارة المستخدمين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          إدارة المستخدمين
        </CardTitle>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => navigate('/users')}
        >
          عرض الكل
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs text-muted-foreground">إجمالي المستخدمين</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/10">
            <UserCheck className="h-5 w-5 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{stats.activeUsers}</p>
            <p className="text-xs text-muted-foreground">نشط</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-500/10">
            <Shield className="h-5 w-5 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">{stats.adminCount}</p>
            <p className="text-xs text-muted-foreground">مشرفين</p>
          </div>
        </div>

        {/* آخر المستخدمين */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">آخر المستخدمين المسجلين</h4>
          {stats.recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user.email.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(user.created_at).toLocaleDateString('ar-SA')}
                </div>
              </div>
              {user.last_login_at && (
                <Badge variant="secondary" className="text-xs">
                  نشط
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
