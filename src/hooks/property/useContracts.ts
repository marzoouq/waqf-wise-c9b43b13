import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { Contract, ContractInsert } from "@/types/contracts";
import { ContractService } from "@/services/contract.service";

export type { Contract, ContractInsert };

export const useContracts = () => {
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: () => ContractService.getAllWithProperties(),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  const addContract = useMutation({
    mutationFn: (contract: ContractInsert & { unit_ids?: string[] }) => 
      ContractService.create(contract),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["rental_payments"] });
      queryClient.invalidateQueries({ queryKey: ["rental-payments-collected"] });
      queryClient.invalidateQueries({ queryKey: ["rental-payments-with-frequency"] });
      queryClient.invalidateQueries({ queryKey: ["property-units"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties-stats"] });
      toast({
        title: "تم إضافة العقد بنجاح",
        description: "تم إنشاء العقد وجدول الدفعات",
      });
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
    mutationFn: ({ id, ...contract }: Partial<Contract> & { id: string }) => 
      ContractService.update(id, contract),
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
    mutationFn: (id: string) => ContractService.delete(id),
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
