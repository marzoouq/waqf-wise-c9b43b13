/**
 * Hook for StaffRequestsManagement data fetching and mutation
 * يجلب ويحدث طلبات المستفيدين للموظفين
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RequestService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface RequestWithBeneficiary {
  id: string;
  request_number?: string;
  request_type_id?: string;
  amount?: number;
  description: string;
  status: string;
  created_at: string;
  decision_notes?: string;
  request_type?: {
    name_ar?: string;
  };
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

// حالات الطلبات المختلفة
const PENDING_STATUSES = ['معلق', 'قيد المراجعة', 'قيد المعالجة', 'pending'];
const APPROVED_STATUSES = ['معتمد', 'موافق', 'موافق عليه', 'approved'];
const REJECTED_STATUSES = ['مرفوض', 'rejected'];

export function useStaffRequestsData() {
  const queryClient = useQueryClient();

  const {
    data: requests = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.ALL_BENEFICIARY_REQUESTS,
    queryFn: () => RequestService.getAllWithBeneficiary() as Promise<RequestWithBeneficiary[]>,
  });

  const updateRequestStatus = useMutation({
    mutationFn: async ({ requestId, status, notes }: { requestId: string; status: string; notes: string }) => {
      // تحويل الحالة للعربية
      const arabicStatus = status === 'approved' ? 'موافق عليه' : status === 'rejected' ? 'مرفوض' : status;
      return RequestService.updateRequestStatus(requestId, arabicStatus, notes);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_BENEFICIARY_REQUESTS });
      toast.success(variables.status === 'approved' ? 'تمت الموافقة على الطلب' : 'تم رفض الطلب');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الطلب');
    },
  });

  // حساب الإحصائيات بناءً على الحالات العربية والإنجليزية
  const stats: RequestStats = {
    total: requests.length,
    pending: requests.filter(r => PENDING_STATUSES.includes(r.status)).length,
    approved: requests.filter(r => APPROVED_STATUSES.includes(r.status)).length,
    rejected: requests.filter(r => REJECTED_STATUSES.includes(r.status)).length,
  };

  const filterRequests = (tab: string) => {
    if (tab === 'pending') return requests.filter(r => PENDING_STATUSES.includes(r.status));
    if (tab === 'approved') return requests.filter(r => APPROVED_STATUSES.includes(r.status));
    if (tab === 'rejected') return requests.filter(r => REJECTED_STATUSES.includes(r.status));
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
