import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/lib/logger";
import { createMutationErrorHandler } from "@/lib/errorHandling";

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
  created_at: string;
  updated_at: string;
}

export function useProperties() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addActivity } = useActivities();
  const { user } = useAuth();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Property[];
    },
    staleTime: 3 * 60 * 1000, // Data stays fresh for 3 minutes
  });

  const addProperty = useMutation({
    mutationFn: async (property: Omit<Property, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("properties")
        .insert([property])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("فشل في إضافة العقار");
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      
      // إضافة نشاط
      try {
        await addActivity({
          action: `تم إضافة عقار جديد: ${data.name}`,
          user_name: user?.email || 'النظام',
        });
      } catch (error) {
        logger.error(error, { context: 'property_activity', severity: 'low' });
      }
      
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
      const { data, error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("فشل في تحديث العقار");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
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
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
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
    addProperty: addProperty.mutateAsync,
    updateProperty: updateProperty.mutateAsync,
    deleteProperty: deleteProperty.mutateAsync,
  };
}
