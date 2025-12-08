import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS, TOAST_MESSAGES, QUERY_STALE_TIME } from "@/lib/constants";
import { useEffect } from "react";
import { createMutationErrorHandler } from "@/lib/errors";
import { FundService } from "@/services/fund.service";
import { supabase } from "@/integrations/supabase/client";

export interface Fund {
  id: string;
  name: string;
  allocated_amount: number;
  spent_amount: number;
  percentage: number;
  beneficiaries_count: number;
  category: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useFunds() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('funds-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'funds' }, () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FUNDS] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const { data: funds = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.FUNDS],
    queryFn: () => FundService.getAll(true),
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });

  const addFund = useMutation({
    mutationFn: (fund: Omit<Fund, "id" | "created_at" | "updated_at">) => FundService.create(fund),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FUNDS] });
      toast({ title: TOAST_MESSAGES.SUCCESS.ADD, description: "تم إضافة الصندوق بنجاح" });
    },
    onError: createMutationErrorHandler({ context: 'add_fund', toastTitle: TOAST_MESSAGES.ERROR.ADD }),
  });

  const updateFund = useMutation({
    mutationFn: ({ id, ...updates }: Partial<Fund> & { id: string }) => FundService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FUNDS] });
      toast({ title: TOAST_MESSAGES.SUCCESS.UPDATE, description: "تم تحديث الصندوق بنجاح" });
    },
    onError: createMutationErrorHandler({ context: 'update_fund', toastTitle: TOAST_MESSAGES.ERROR.UPDATE }),
  });

  return {
    funds,
    isLoading,
    addFund: addFund.mutate,
    addFundAsync: addFund.mutateAsync,
    updateFund: updateFund.mutate,
    updateFundAsync: updateFund.mutateAsync,
  };
}
