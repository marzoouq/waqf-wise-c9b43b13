import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUserStats } from "@/hooks/admin/useUserStats";
import { ErrorState } from "@/components/shared/ErrorState";

export function UserManagementSection() {
  const navigate = useNavigate();
  const { data: stats, isLoading, error, refetch } = useUserStats();

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

  if (error) {
    return <ErrorState title="خطأ في تحميل إحصائيات المستخدمين" message={(error as Error).message} onRetry={refetch} />;
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2 text-primary" />
            <p className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs text-muted-foreground">إجمالي المستخدمين</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-status-success/10">
            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2 text-status-success" />
            <p className="text-xl sm:text-2xl font-bold">{stats.activeUsers}</p>
            <p className="text-xs text-muted-foreground">نشط</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-accent/10">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2 text-accent" />
            <p className="text-xl sm:text-2xl font-bold">{stats.adminCount}</p>
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
