/**
 * Hook for StaffRequestsManagement data fetching and mutation
 * يجلب ويحدث طلبات المستفيدين للموظفين
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RequestWithBeneficiary {
  id: string;
  request_number?: string;
  request_type_id?: string;
  amount?: number;
  description: string;
  status: string;
  created_at: string;
  decision_notes?: string;
  beneficiary: {
    full_name: string;
    national_id: string;
    phone: string;
  };
}

export interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export function useStaffRequestsData() {
  const queryClient = useQueryClient();

  const {
    data: requests = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['all-beneficiary-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiary_requests')
        .select(`
          *,
          beneficiary:beneficiaries(
            full_name,
            national_id,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RequestWithBeneficiary[];
    },
  });

  const updateRequestStatus = useMutation({
    mutationFn: async ({ requestId, status, notes }: { requestId: string; status: string; notes: string }) => {
      const { error } = await supabase
        .from('beneficiary_requests')
        .update({
          status,
          decision_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-beneficiary-requests'] });
      toast.success(variables.status === 'approved' ? 'تمت الموافقة على الطلب' : 'تم رفض الطلب');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الطلب');
    },
  });

  const stats: RequestStats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const filterRequests = (tab: string) => {
    if (tab === 'pending') return requests.filter(r => r.status === 'pending');
    if (tab === 'approved') return requests.filter(r => r.status === 'approved');
    if (tab === 'rejected') return requests.filter(r => r.status === 'rejected');
    return requests;
  };

  return {
    requests,
    stats,
    isLoading,
    error,
    updateRequestStatus,
    filterRequests,
    isUpdating: updateRequestStatus.isPending,
  };
}
