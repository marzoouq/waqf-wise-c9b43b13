import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Trash2, Shield } from 'lucide-react';
import { ROLE_NAMES_AR, type RoleName } from '@/types/auth';

/**
 * مكون إدارة أدوار المستخدمين
 * يسمح للمشرفين بإضافة وإزالة أدوار المستخدمين
 */
export function UserRolesManager({ userId }: { userId: string }) {
  const [selectedRole, setSelectedRole] = useState<RoleName>('nazer');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب أدوار المستخدم الحالية
  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ['user-roles-manager', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;
      return data.map(r => r.role as RoleName);
    },
  });

  // إضافة دور جديد
  const addRoleMutation = useMutation({
    mutationFn: async (role: RoleName) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: role as any });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles-manager', userId] });
      toast({
        title: 'تم إضافة الدور',
        description: 'تم إضافة الدور بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل إضافة الدور',
        variant: 'destructive',
      });
    },
  });

  // حذف دور
  const deleteRoleMutation = useMutation({
    mutationFn: async (role: RoleName) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles-manager', userId] });
      toast({
        title: 'تم حذف الدور',
        description: 'تم حذف الدور بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل حذف الدور',
        variant: 'destructive',
      });
    },
  });

  const handleAddRole = () => {
    if (userRoles.includes(selectedRole)) {
      toast({
        title: 'تنبيه',
        description: 'هذا الدور موجود بالفعل',
        variant: 'destructive',
      });
      return;
    }
    addRoleMutation.mutate(selectedRole);
  };

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
                    onClick={() => deleteRoleMutation.mutate(role)}
                    disabled={deleteRoleMutation.isPending}
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
            onClick={handleAddRole}
            disabled={addRoleMutation.isPending}
          >
            {addRoleMutation.isPending ? (
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