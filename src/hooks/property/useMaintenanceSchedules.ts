import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MaintenanceService } from "@/services/maintenance.service";
import { useToast } from "@/hooks/use-toast";
import { productionLogger } from "@/lib/logger/production-logger";
import { Database } from "@/integrations/supabase/types";

type MaintenanceSchedule = Database['public']['Tables']['maintenance_schedules']['Row'];
type MaintenanceScheduleInsert = Database['public']['Tables']['maintenance_schedules']['Insert'];

export const useMaintenanceSchedules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['maintenance-schedules'],
    queryFn: () => MaintenanceService.getSchedules(),
  });

  const addSchedule = useMutation({
    mutationFn: (schedule: MaintenanceScheduleInsert) => MaintenanceService.addSchedule(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
      toast({
        title: "تم بنجاح",
        description: "تم إضافة جدول الصيانة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل إضافة جدول الصيانة",
        variant: "destructive",
      });
      productionLogger.error('Error adding schedule:', error);
    },
  });

  const updateSchedule = useMutation({
    mutationFn: ({ id, ...updates }: Partial<MaintenanceSchedule> & { id: string }) =>
      MaintenanceService.updateSchedule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
      toast({
        title: "تم بنجاح",
        description: "تم تحديث جدول الصيانة",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تحديث جدول الصيانة",
        variant: "destructive",
      });
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: (id: string) => MaintenanceService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف جدول الصيانة",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل حذف جدول الصيانة",
        variant: "destructive",
      });
    },
  });

  return {
    schedules,
    isLoading,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  };
};

export type { MaintenanceSchedule };
