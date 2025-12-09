import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoansService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { EmergencyAid } from "@/types/loans";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useEmergencyAid() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emergencyAids = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.EMERGENCY_AID,
    queryFn: () => LoansService.getEmergencyAids(),
  });

  const addEmergencyAid = useMutation({
    mutationFn: (aid: Omit<EmergencyAid, 'id' | 'created_at' | 'updated_at'>) => 
      LoansService.createEmergencyAid(aid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMERGENCY_AID });
      toast({ title: "تم تقديم طلب الفزعة" });
    },
  });

  const updateEmergencyAid = useMutation({
    mutationFn: ({ id, ...updates }: Partial<EmergencyAid> & { id: string }) => 
      LoansService.updateEmergencyAid(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMERGENCY_AID });
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
