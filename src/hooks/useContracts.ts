import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Contract {
  id: string;
  contract_number: string;
  property_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_id_number: string;
  tenant_email?: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  payment_frequency: string;
  status: string;
  is_renewable: boolean;
  auto_renew: boolean;
  renewal_notice_days: number;
  terms_and_conditions?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  properties?: {
    name: string;
    type: string;
    location: string;
  };
}

export const useContracts = () => {
  const queryClient = useQueryClient();

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          properties(name, type, location)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Contract[];
    },
  });

  const addContract = useMutation({
    mutationFn: async (contract: any) => {
      const { data, error } = await supabase
        .from("contracts")
        .insert([contract])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({
        title: "تم إضافة العقد",
        description: "تم إضافة العقد بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العقد",
        variant: "destructive",
      });
      console.error("Error adding contract:", error);
    },
  });

  const updateContract = useMutation({
    mutationFn: async ({ id, ...contract }: Partial<Contract> & { id: string }) => {
      const { data, error } = await supabase
        .from("contracts")
        .update(contract)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({
        title: "تم تحديث العقد",
        description: "تم تحديث العقد بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث العقد",
        variant: "destructive",
      });
      console.error("Error updating contract:", error);
    },
  });

  const deleteContract = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contracts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({
        title: "تم حذف العقد",
        description: "تم حذف العقد بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العقد",
        variant: "destructive",
      });
      console.error("Error deleting contract:", error);
    },
  });

  return {
    contracts,
    isLoading,
    addContract,
    updateContract,
    deleteContract,
  };
};