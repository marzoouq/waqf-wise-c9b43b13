import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PropertyService, RealtimeService } from "@/services";
import { useToast } from "@/hooks/ui/use-toast";
import { useActivities } from "@/hooks/ui/useActivities";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";
import { createMutationErrorHandler } from "@/lib/errors";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  units: number;
  occupied: number;
  monthly_revenue: number;
  status: string;
  description?: string;
  tax_percentage?: number;
  shop_count?: number;
  apartment_count?: number;
  revenue_type?: string;
  created_at: string;
  updated_at: string;
  waqf_unit_id?: string;
  monthly_rent?: number;
  floors_count?: number;
}

export function useProperties() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addActivity } = useActivities();
  const { user } = useAuth();

  const { data: properties = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.PROPERTIES,
    queryFn: () => PropertyService.getAll(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const { unsubscribe } = RealtimeService.subscribeToTable('properties', () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES });
    });

    return () => unsubscribe();
  }, [queryClient]);

  const addProperty = useMutation({
    mutationFn: async (property: Omit<Property, "id" | "created_at" | "updated_at">) => {
      return PropertyService.create(property);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES });
      
      addActivity({
        action: `تم إضافة عقار جديد: ${data.name}`,
        user_name: user?.email || 'النظام',
      }).catch((error) => {
        logger.error(error, { context: 'property_activity', severity: 'low' });
      });
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة العقار الجديد بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'add_property',
      toastTitle: 'خطأ في الإضافة',
    }),
  });

  const updateProperty = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Property> & { id: string }) => {
      return PropertyService.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات العقار بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'update_property',
      toastTitle: 'خطأ في التحديث',
    }),
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      return PropertyService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف العقار بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'delete_property',
      toastTitle: 'خطأ في الحذف',
    }),
  });

  return {
    properties,
    isLoading,
    error,
    refetch,
    addProperty: addProperty.mutateAsync,
    updateProperty: updateProperty.mutateAsync,
    deleteProperty: deleteProperty.mutateAsync,
  };
}
