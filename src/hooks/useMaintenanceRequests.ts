import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface MaintenanceRequest {
  id: string;
  request_number: string;
  property_id: string;
  contract_id?: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  requested_by: string;
  requested_date: string;
  scheduled_date?: string;
  completed_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  assigned_to?: string;
  vendor_name?: string;
  notes?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
  properties?: {
    name: string;
    location: string;
  };
}

export const useMaintenanceRequests = () => {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["maintenance_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(`
          *,
          properties(name, location)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MaintenanceRequest[];
    },
  });

  const addRequest = useMutation({
    mutationFn: async (request: any) => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .insert([request])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance_requests"] });
      toast({
        title: "تم إضافة الطلب",
        description: "تم إضافة طلب الصيانة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الطلب",
        variant: "destructive",
      });
      console.error("Error adding maintenance request:", error);
    },
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, ...request }: Partial<MaintenanceRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .update(request)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance_requests"] });
      toast({
        title: "تم تحديث الطلب",
        description: "تم تحديث طلب الصيانة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الطلب",
        variant: "destructive",
      });
      console.error("Error updating maintenance request:", error);
    },
  });

  return {
    requests,
    isLoading,
    addRequest,
    updateRequest,
  };
};