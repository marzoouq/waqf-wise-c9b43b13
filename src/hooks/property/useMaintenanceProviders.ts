import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MaintenanceService, type ProviderRating } from "@/services/maintenance.service";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type MaintenanceProvider = Database['public']['Tables']['maintenance_providers']['Row'];
type MaintenanceProviderInsert = Database['public']['Tables']['maintenance_providers']['Insert'];
type MaintenanceProviderUpdate = Database['public']['Tables']['maintenance_providers']['Update'];

export function useMaintenanceProviders() {
  const queryClient = useQueryClient();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["maintenance-providers"],
    queryFn: () => MaintenanceService.getProviders(true),
  });

  const addProvider = useMutation({
    mutationFn: (provider: MaintenanceProviderInsert) =>
      MaintenanceService.addProvider(provider),
    onSuccess: () => {
      toast.success("تمت إضافة مقدم الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["maintenance-providers"] });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة مقدم الخدمة");
    }
  });

  const updateProvider = useMutation({
    mutationFn: ({ id, ...updates }: MaintenanceProviderUpdate & { id: string }) =>
      MaintenanceService.updateProvider(id, updates),
    onSuccess: () => {
      toast.success("تم تحديث مقدم الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["maintenance-providers"] });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تحديث مقدم الخدمة");
    }
  });

  const deleteProvider = useMutation({
    mutationFn: (id: string) => MaintenanceService.deleteProvider(id),
    onSuccess: () => {
      toast.success("تم حذف مقدم الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["maintenance-providers"] });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف مقدم الخدمة");
    }
  });

  const rateProvider = useMutation({
    mutationFn: (rating: ProviderRating) => MaintenanceService.rateProvider(rating),
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
