/**
 * Role Permissions Data Hook
 * @version 2.8.37
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/hooks/useUserRole";

interface RolePermissionState {
  permissionId: string;
  granted: boolean;
  modified: boolean;
}

export function useRolePermissionsData(role: AppRole) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [modifications, setModifications] = useState<Map<string, RolePermissionState>>(new Map());

  const query = useQuery({
    queryKey: ["role-permissions", role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role", role);
      
      if (error) throw error;
      return data;
    },
    enabled: !!role,
  });

  const updatePermissionMutation = useMutation({
    mutationFn: async ({ permissionId, granted }: { permissionId: string; granted: boolean }) => {
      const { error } = await supabase
        .from("role_permissions")
        .upsert({
          role: role,
          permission_id: permissionId,
          granted
        }, {
          onConflict: 'role,permission_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث الصلاحيات بنجاح",
      });
      setModifications(new Map());
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل تحديث الصلاحيات",
        variant: "destructive",
      });
    },
  });

  const saveAllModifications = async () => {
    const updates: Array<{ permissionId: string; granted: boolean }> = [];
    modifications.forEach((state, permissionId) => {
      if (state.modified) {
        updates.push({ permissionId, granted: state.granted });
      }
    });

    for (const update of updates) {
      await updatePermissionMutation.mutateAsync(update);
    }
  };

  const isPermissionGranted = (permissionId: string): boolean => {
    const modification = modifications.get(permissionId);
    if (modification !== undefined) {
      return modification.granted;
    }
    
    return (query.data || []).some(rp => rp.permission_id === permissionId && rp.granted);
  };

  const togglePermission = (permissionId: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setModifications(prev => {
      const newMap = new Map(prev);
      newMap.set(permissionId, {
        permissionId,
        granted: newValue,
        modified: true
      });
      return newMap;
    });
  };

  const resetModifications = () => {
    setModifications(new Map());
  };

  return {
    ...query,
    rolePermissions: query.data || [],
    modifications,
    hasModifications: modifications.size > 0,
    updatePermissionMutation,
    saveAllModifications,
    isPermissionGranted,
    togglePermission,
    resetModifications,
  };
}
