import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, Trash2, Shield } from 'lucide-react';
import { ROLE_NAMES_AR, type RoleName } from '@/types/auth';
import { useUserRolesManager } from '@/hooks/users/useUserRolesManager';

/**
 * مكون إدارة أدوار المستخدمين
 * يسمح للمشرفين بإضافة وإزالة أدوار المستخدمين
 */
export function UserRolesManager({ userId }: { userId: string }) {
  const {
    userRoles,
    isLoading,
    selectedRole,
    setSelectedRole,
    addRole,
    deleteRole,
    isAdding,
    isDeleting,
  } = useUserRolesManager(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          إدارة الأدوار
        </CardTitle>
        <CardDescription>
          إضافة وإزالة أدوار المستخدم في النظام
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* الأدوار الحالية */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">الأدوار الحالية</h4>
          <div className="flex flex-wrap gap-2">
            {userRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد أدوار</p>
            ) : (
              userRoles.map((role) => (
                <Badge key={role} variant="secondary" className="gap-2">
                  {ROLE_NAMES_AR[role]}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => deleteRole(role)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* إضافة دور جديد */}
        <div className="flex gap-2">
          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as RoleName)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_NAMES_AR).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={addRole}
            disabled={isAdding}
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            ) : (
              <UserPlus className="h-4 w-4 ml-2" />
            )}
            إضافة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
