import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MaintenanceProvider {
  id: string;
  provider_name: string;
  contact_person?: string;
  phone: string;
  email?: string;
  address?: string;
  specialization?: string[];
  rating: number;
  total_jobs: number;
  active_jobs: number;
  average_cost?: number;
  average_response_time?: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useMaintenanceProviders() {
  const queryClient = useQueryClient();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["maintenance-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_providers")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });
      
      if (error) throw error;
      return data as MaintenanceProvider[];
    }
  });

  const addProvider = useMutation({
    mutationFn: async (provider: any) => {
      const { data, error } = await supabase
        .from("maintenance_providers")
        .insert([provider])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تمت إضافة مقدم الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["maintenance-providers"] });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة مقدم الخدمة");
    }
  });

  const updateProvider = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MaintenanceProvider> & { id: string }) => {
      const { data, error } = await supabase
        .from("maintenance_providers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تم تحديث مقدم الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["maintenance-providers"] });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تحديث مقدم الخدمة");
    }
  });

  const deleteProvider = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("maintenance_providers")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حذف مقدم الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["maintenance-providers"] });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف مقدم الخدمة");
    }
  });

  const rateProvider = useMutation({
    mutationFn: async (rating: {
      provider_id: string;
      maintenance_request_id?: string;
      rating: number;
      quality_score?: number;
      timeliness_score?: number;
      cost_score?: number;
      comments?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("provider_ratings")
        .insert([{ ...rating, rated_by: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تم إضافة التقييم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["maintenance-providers"] });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة التقييم");
    }
  });

  return {
    providers,
    isLoading,
    addProvider: addProvider.mutate,
    updateProvider: updateProvider.mutate,
    deleteProvider: deleteProvider.mutate,
    rateProvider: rateProvider.mutate
  };
}