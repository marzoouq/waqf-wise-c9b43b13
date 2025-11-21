import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type DbPropertyUnit = Database['public']['Tables']['property_units']['Row'];
type DbPropertyUnitInsert = Database['public']['Tables']['property_units']['Insert'];
type DbPropertyUnitUpdate = Database['public']['Tables']['property_units']['Update'];

export function usePropertyUnits(propertyId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: units = [], isLoading } = useQuery({
    queryKey: ["property-units", propertyId],
    queryFn: async () => {
      let query = supabase
        .from("property_units")
        .select("*")
        .order("unit_number");
      
      if (propertyId) {
        query = query.eq("property_id", propertyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const addUnit = useMutation({
    mutationFn: async (unit: DbPropertyUnitInsert) => {
      const { data, error } = await supabase
        .from("property_units")
        .insert([unit])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-units"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة الوحدة بنجاح",
      });
    },
  });

  const updateUnit = useMutation({
    mutationFn: async ({ id, ...updates }: DbPropertyUnitUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("property_units")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-units"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث الوحدة بنجاح",
      });
    },
  });

  const deleteUnit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("property_units")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-units"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الوحدة بنجاح",
      });
    },
  });

  return {
    units,
    isLoading,
    addUnit: addUnit.mutateAsync,
    updateUnit: updateUnit.mutateAsync,
    deleteUnit: deleteUnit.mutateAsync,
  };
}
