import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { Contract, ContractInsert } from "@/types/contracts";

export type { Contract, ContractInsert };

export const useContracts = () => {
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
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
      return (data || []) as Contract[];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  const addContract = useMutation({
    mutationFn: async (contract: ContractInsert & { unit_ids?: string[] }) => {
      const { unit_ids, ...contractData } = contract;
      
      const { data, error } = await supabase
        .from("contracts")
        .insert([contractData])
        .select()
        .single();

      if (error) throw error;

      // ربط الوحدات بالعقد
      if (data && unit_ids && unit_ids.length > 0) {
        const contractUnits = unit_ids.map(unitId => ({
          contract_id: data.id,
          property_unit_id: unitId,
        }));

        const { error: unitsError } = await supabase
          .from("contract_units")
          .insert(contractUnits);

        if (unitsError) {
          logger.error(unitsError, { context: 'link_contract_units', severity: 'high' });
          // لا نوقف العملية، العقد تم إنشاؤه بالفعل
          toast({
            title: "تحذير",
            description: "تم إنشاء العقد لكن فشل في ربط بعض الوحدات",
            variant: "destructive",
          });
        }
      }

      // إنشاء جدول الدفعات تلقائياً
      if (data) {
        const { data: scheduleResult, error: scheduleError } = await supabase
          .rpc('create_payment_schedule', {
            p_contract_id: data.id,
            p_start_date: data.start_date,
            p_end_date: data.end_date,
            p_monthly_rent: data.monthly_rent,
            p_payment_frequency: data.payment_frequency
          });

        if (scheduleError) {
          logger.error(scheduleError, { context: 'create_payment_schedule', severity: 'high' });
          toast({
            title: "تحذير",
            description: "تم إنشاء العقد لكن فشل في إنشاء جدول الدفعات",
            variant: "destructive",
          });
        } else if (scheduleResult && typeof scheduleResult === 'object' && 'success' in scheduleResult) {
          const result = scheduleResult as { success: boolean; payments_created?: number };
          if (result.success) {
            toast({
              title: "تم إضافة العقد بنجاح",
              description: `تم إنشاء العقد مع ${result.payments_created || 0} دفعة وربط ${unit_ids?.length || 0} وحدة`,
            });
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["rental_payments"] });
      queryClient.invalidateQueries({ queryKey: ["rental-payments-collected"] });
      queryClient.invalidateQueries({ queryKey: ["rental-payments-with-frequency"] });
      queryClient.invalidateQueries({ queryKey: ["property-units"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties-stats"] });
    },
    onError: (error) => {
      logger.error(error, { context: 'add_contract', severity: 'medium' });
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العقد",
        variant: "destructive",
      });
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
      logger.error(error, { context: 'update_contract', severity: 'medium' });
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث العقد",
        variant: "destructive",
      });
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
      logger.error(error, { context: 'delete_contract', severity: 'high' });
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العقد",
        variant: "destructive",
      });
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