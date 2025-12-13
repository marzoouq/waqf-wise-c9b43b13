/**
 * Hook لإدارة المستخدمين
 * Users Management Hook
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/hooks/auth/useUserRole";
import { AuthService } from "@/services/auth.service";
import { invalidateUserQueries } from "@/lib/query-invalidation";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  user_roles?: Array<{ role: string }>;
}

/**
 * جلب قائمة المستخدمين مع أدوارهم
 */
export function useUsersQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.USERS,
    queryFn: async () => {
      const users = await AuthService.getUsers();
      return users as UserProfile[];
    },
  });
}

/**
 * حذف مستخدم
 */
export function useDeleteUser() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await AuthService.deleteUser(userId);
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف",
        description: "تم حذف المستخدم بنجاح",
      });
      invalidateUserQueries(queryClient);
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      });
    },
  });
}

/**
 * تحديث أدوار المستخدم
 */
export function useUpdateUserRoles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: AppRole[] }) => {
      await AuthService.updateUserRoles(userId, roles);
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث أدوار المستخدم بنجاح",
      });
      invalidateUserQueries(queryClient);
    },
    onError: (error) => {
      console.error("Error updating roles:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الأدوار",
        variant: "destructive",
      });
    },
  });
}

/**
 * تحديث حالة المستخدم (تفعيل/تعطيل)
 */
export function useUpdateUserStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      await AuthService.updateUserStatus(userId, isActive);
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة المستخدم بنجاح",
      });
      invalidateUserQueries(queryClient);
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الحالة",
        variant: "destructive",
      });
    },
  });
}

/**
 * إعادة تعيين كلمة مرور المستخدم
 */
export function useResetUserPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      // هذه العملية تتطلب Edge Function
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { user_id: userId, new_password: password }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تعيين كلمة المرور الجديدة بنجاح",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "فشل تحديث كلمة المرور";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });
}

/**
 * Hook موحد لإدارة المستخدمين
 */
export function useUsersManagement() {
  const usersQuery = useUsersQuery();
  const deleteUserMutation = useDeleteUser();
  const updateRolesMutation = useUpdateUserRoles();
  const updateStatusMutation = useUpdateUserStatus();
  const resetPasswordMutation = useResetUserPassword();

  return {
    // البيانات
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
    
    // الحذف
    deleteUser: deleteUserMutation,
    isDeleting: deleteUserMutation.isPending,
    
    // تحديث الأدوار
    updateRoles: updateRolesMutation,
    isUpdatingRoles: updateRolesMutation.isPending,
    
    // تحديث الحالة
    updateStatus: updateStatusMutation,
    isUpdatingStatus: updateStatusMutation.isPending,
    
    // إعادة تعيين كلمة المرور
    resetPassword: resetPasswordMutation,
    isResettingPassword: resetPasswordMutation.isPending,
  };
}
