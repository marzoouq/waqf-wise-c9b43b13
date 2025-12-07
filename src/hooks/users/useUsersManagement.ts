/**
 * Hook لإدارة المستخدمين
 * Users Management Hook
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/hooks/auth/useUserRole";

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
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: rolesData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.user_id);

          return {
            ...profile,
            user_roles: rolesData || [],
          };
        })
      );

      return usersWithRoles as UserProfile[];
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
      // حذف أدوار المستخدم أولاً
      await supabase.from("user_roles").delete().eq("user_id", userId);
      
      // حذف الملف الشخصي
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف",
        description: "تم حذف المستخدم بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
      // حذف الأدوار الحالية
      await supabase.from("user_roles").delete().eq("user_id", userId);

      // إضافة الأدوار الجديدة
      if (roles.length > 0) {
        const rolesToInsert = roles.map(role => ({ 
          user_id: userId, 
          role: role
        }));

        const { error } = await supabase
          .from("user_roles")
          .insert(rolesToInsert);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث أدوار المستخدم بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة المستخدم بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
