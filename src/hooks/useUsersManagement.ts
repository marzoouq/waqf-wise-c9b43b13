/**
 * Hook لإدارة المستخدمين
 * Users Management Hook
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/hooks/useUserRole";

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
 * Hook موحد لإدارة المستخدمين
 */
export function useUsersManagement() {
  const deleteUser = useDeleteUser();
  const updateRoles = useUpdateUserRoles();
  const updateStatus = useUpdateUserStatus();

  return {
    deleteUser: deleteUser.mutateAsync,
    isDeleting: deleteUser.isPending,
    updateRoles: updateRoles.mutateAsync,
    isUpdatingRoles: updateRoles.isPending,
    updateStatus: updateStatus.mutateAsync,
    isUpdatingStatus: updateStatus.isPending,
  };
}
