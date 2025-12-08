import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MaintenanceService, type ProviderRating } from "@/services/maintenance.service";
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
    queryFn: () => MaintenanceService.getProviders(true),
  });

  const addProvider = useMutation({
    mutationFn: (provider: Omit<MaintenanceProvider, 'id' | 'created_at' | 'updated_at'>) =>
      MaintenanceService.addProvider(provider as any),
    onSuccess: () => {
      toast.success("تمت إضافة مقدم الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["maintenance-providers"] });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة مقدم الخدمة");
    }
  });

  const updateProvider = useMutation({
    mutationFn: ({ id, ...updates }: Partial<MaintenanceProvider> & { id: string }) =>
      MaintenanceService.updateProvider(id, updates as any),
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
