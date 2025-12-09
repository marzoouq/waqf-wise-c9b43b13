/**
 * Hook لإدارة أدوار مستخدم محدد
 * User Roles Manager Hook
 * @version 2.8.55
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { type RoleName } from '@/types/auth';
import { UserService } from '@/services';
import { QUERY_KEYS } from '@/lib/query-keys';

export function useUserRolesManager(userId: string) {
  const [selectedRole, setSelectedRole] = useState<RoleName>('nazer');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب أدوار المستخدم الحالية
  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.USER_ROLES(userId),
    queryFn: () => UserService.getUserRolesForManager(userId),
    enabled: !!userId,
  });

  // إضافة دور جديد
  const addRoleMutation = useMutation({
    mutationFn: (role: RoleName) => UserService.addUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ROLES(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      toast({
        title: 'تم إضافة الدور',
        description: 'تم إضافة الدور بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل إضافة الدور',
        variant: 'destructive',
      });
    },
  });

  // حذف دور
  const deleteRoleMutation = useMutation({
    mutationFn: (role: RoleName) => UserService.deleteUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ROLES(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      toast({
        title: 'تم حذف الدور',
        description: 'تم حذف الدور بنجاح',
      });
    },
    onError: (error: Error) => {
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

  return {
    userRoles: userRoles as RoleName[],
    isLoading,
    selectedRole,
    setSelectedRole,
    addRole: handleAddRole,
    deleteRole: deleteRoleMutation.mutate,
    isAdding: addRoleMutation.isPending,
    isDeleting: deleteRoleMutation.isPending,
  };
}
