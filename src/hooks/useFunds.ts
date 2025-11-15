import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS, TOAST_MESSAGES, QUERY_STALE_TIME } from "@/lib/constants";
import { useEffect } from "react";

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

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('funds-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'funds'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FUNDS] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: funds = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.FUNDS],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funds")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Fund[];
    },
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });

  const addFund = useMutation({
    mutationFn: async (fund: Omit<Fund, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("funds")
        .insert([fund])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("فشل في إضافة الصندوق");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FUNDS] });
      toast({
        title: TOAST_MESSAGES.SUCCESS.ADD,
        description: "تم إضافة الصندوق بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: TOAST_MESSAGES.ERROR.ADD,
        description: error.message || "حدث خطأ أثناء إضافة الصندوق",
        variant: "destructive",
      });
    },
  });

  const updateFund = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Fund> & { id: string }) => {
      const { data, error } = await supabase
        .from("funds")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("فشل في تحديث الصندوق");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FUNDS] });
      toast({
        title: TOAST_MESSAGES.SUCCESS.UPDATE,
        description: "تم تحديث الصندوق بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: TOAST_MESSAGES.ERROR.UPDATE,
        description: error.message || "حدث خطأ أثناء تحديث الصندوق",
        variant: "destructive",
      });
    },
  });

  return {
    funds,
    isLoading,
    addFund: addFund.mutateAsync,
    updateFund: updateFund.mutateAsync,
  };
}
