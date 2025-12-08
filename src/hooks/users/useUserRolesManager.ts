/**
 * Hook لإدارة أدوار مستخدم محدد
 * User Roles Manager Hook
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { type RoleName } from '@/types/auth';
import { Database } from '@/integrations/supabase/types';

type DbAppRole = Database['public']['Enums']['app_role'];

export function useUserRolesManager(userId: string) {
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
        .insert({ user_id: userId, role: role as DbAppRole });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles-manager', userId] });
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
    mutationFn: async (role: RoleName) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as DbAppRole);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles-manager', userId] });
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
    userRoles,
    isLoading,
    selectedRole,
    setSelectedRole,
    addRole: handleAddRole,
    deleteRole: deleteRoleMutation.mutate,
    isAdding: addRoleMutation.isPending,
    isDeleting: deleteRoleMutation.isPending,
  };
}
