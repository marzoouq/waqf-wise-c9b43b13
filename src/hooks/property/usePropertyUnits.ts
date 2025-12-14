import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { PropertyService } from "@/services/property.service";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { Database } from "@/integrations/supabase/types";

type DbPropertyUnitInsert = Database['public']['Tables']['property_units']['Insert'];
type DbPropertyUnitUpdate = Database['public']['Tables']['property_units']['Update'];

export function usePropertyUnits(propertyId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: units = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.PROPERTY_UNITS(propertyId || ''),
    queryFn: () => PropertyService.getUnits(propertyId),
  });

  const addUnit = useMutation({
    mutationFn: (unit: DbPropertyUnitInsert) => PropertyService.createUnit(unit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-units'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة الوحدة بنجاح",
      });
    },
  });

  const updateUnit = useMutation({
    mutationFn: ({ id, ...updates }: DbPropertyUnitUpdate & { id: string }) => 
      PropertyService.updateUnit(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-units'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث الوحدة بنجاح",
      });
    },
  });

  const deleteUnit = useMutation({
    mutationFn: (id: string) => PropertyService.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-units'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الوحدة بنجاح",
      });
    },
  });

  return {
    units,
    isLoading,
    error: error as Error | null,
    refetch,
    addUnit: addUnit.mutateAsync,
    updateUnit: updateUnit.mutateAsync,
    deleteUnit: deleteUnit.mutateAsync,
  };
}
