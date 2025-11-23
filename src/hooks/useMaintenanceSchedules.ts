import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type MaintenanceSchedule = Database['public']['Tables']['maintenance_schedules']['Row'];
type MaintenanceScheduleInsert = Database['public']['Tables']['maintenance_schedules']['Insert'];

export const useMaintenanceSchedules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['maintenance-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          properties:property_id (
            id,
            name,
            location
          ),
          property_units:property_unit_id (
            id,
            unit_number,
            unit_name
          )
        `)
        .order('next_maintenance_date', { ascending: true });

      if (error) throw error;
      return data as MaintenanceSchedule[];
    },
  });

  const addSchedule = useMutation({
    mutationFn: async (schedule: MaintenanceScheduleInsert) => {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .insert(schedule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
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
      console.error('Error adding schedule:', error);
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MaintenanceSchedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('maintenance_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
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
