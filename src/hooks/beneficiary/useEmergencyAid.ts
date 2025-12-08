import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EmergencyAid } from "@/types/loans";

export function useEmergencyAid() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emergencyAids = [], isLoading } = useQuery({
    queryKey: ["emergency-aid"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emergency_aid")
        .select(`*, beneficiaries (full_name, national_id, phone)`)
        .order("requested_date", { ascending: false });
      if (error) throw error;
      return data as EmergencyAid[];
    },
  });

  const addEmergencyAid = useMutation({
    mutationFn: async (aid: Omit<EmergencyAid, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from("emergency_aid").insert([aid]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-aid"] });
      toast({ title: "تم تقديم طلب الفزعة" });
    },
  });

  const updateEmergencyAid = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmergencyAid> & { id: string }) => {
      const { data, error } = await supabase.from("emergency_aid").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-aid"] });
      toast({ title: "تم التحديث" });
    },
  });

  return {
    emergencyAids,
    isLoading,
    addEmergencyAid: addEmergencyAid.mutate,
    updateEmergencyAid: updateEmergencyAid.mutate,
  };
}
