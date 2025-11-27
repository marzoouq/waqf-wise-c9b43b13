import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { VoucherService, type VoucherData } from "@/services/voucher.service";

export interface PaymentVoucher {
  id: string;
  voucher_number: string;
  voucher_type: string;
  amount: number;
  beneficiary_id?: string;
  payment_method?: string;
  description: string;
  notes?: string;
  status: string;
  distribution_id?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
  bank_account_id?: string;
  created_by?: string;
  attachments?: Record<string, unknown>[];
}

export function usePaymentVouchers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('payment-vouchers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_vouchers'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["payment_vouchers"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ["payment_vouchers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_vouchers")
        .select(`
          *,
          beneficiaries (
            id,
            full_name,
            national_id
          )
        `)
        .order("voucher_date", { ascending: false });

      if (error) throw error;
      return data as PaymentVoucher[];
    },
    staleTime: 3 * 60 * 1000,
  });

  const addVoucher = useMutation({
    mutationFn: async (voucherData: VoucherData) => {
      const result = await VoucherService.create(voucherData);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast({
        title: "تم إنشاء السند بنجاح",
        description: "تم توليد رقم السند تلقائياً",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في الإنشاء",
        description: error.message,
      });
    }
  });

  const markVoucherAsPaid = useMutation({
    mutationFn: async (voucherId: string) => {
      const result = await VoucherService.markAsPaid(voucherId);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast({
        title: "تم تحديث حالة السند",
        description: "تم إنشاء القيد المحاسبي تلقائياً",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في التحديث",
        description: error.message,
      });
    }
  });

  const deleteVoucher = useMutation({
    mutationFn: async (voucherId: string) => {
      await VoucherService.delete(voucherId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_vouchers"] });
      toast({
        title: "تم حذف السند بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في الحذف",
        description: error.message,
      });
    }
  });

  const generateVouchersFromDistribution = useMutation({
    mutationFn: async (distributionId: string) => {
      const result = await VoucherService.generateVouchersFromDistribution(distributionId);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["payment_vouchers"] });
      toast({
        title: "تم توليد السندات بنجاح",
        description: `تم إنشاء ${result.count} سند من التوزيع`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في التوليد",
        description: error.message,
      });
    }
  });

  return {
    vouchers,
    isLoading,
    addVoucher: addVoucher.mutateAsync,
    markVoucherAsPaid: markVoucherAsPaid.mutateAsync,
    deleteVoucher: deleteVoucher.mutateAsync,
    generateVouchersFromDistribution: generateVouchersFromDistribution.mutateAsync,
  };
}
