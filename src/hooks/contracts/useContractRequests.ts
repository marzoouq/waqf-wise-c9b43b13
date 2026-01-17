/**
 * Hook لإدارة طلبات العقود (فسخ، تعديل إيجار)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TerminationRequest {
  id: string;
  contract_id: string;
  requested_by: 'landlord' | 'tenant';
  termination_type: 'mutual' | 'unilateral';
  requested_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  response_notes: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface RentAdjustmentRequest {
  id: string;
  contract_id: string;
  requested_by: string;
  adjustment_type: string;
  current_rent: number;
  requested_rent: number;
  adjustment_percentage: number | null;
  reason: string;
  effective_date: string;
  status: string;
  response_notes: string | null;
  final_rent: number | null;
  created_at: string;
  updated_at: string | null;
}

export function useContractRequests(contractId?: string) {
  const queryClient = useQueryClient();

  // جلب طلبات الفسخ
  const {
    data: terminationRequests,
    isLoading: isLoadingTermination,
    refetch: refetchTermination,
  } = useQuery({
    queryKey: ['termination-requests', contractId],
    queryFn: async () => {
      let query = supabase
        .from('contract_termination_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (contractId) {
        query = query.eq('contract_id', contractId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TerminationRequest[];
    },
  });

  // جلب طلبات تعديل الإيجار
  const {
    data: rentAdjustmentRequests,
    isLoading: isLoadingRentAdjustment,
    refetch: refetchRentAdjustment,
  } = useQuery({
    queryKey: ['rent-adjustment-requests', contractId],
    queryFn: async () => {
      let query = supabase
        .from('rent_adjustment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (contractId) {
        query = query.eq('contract_id', contractId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RentAdjustmentRequest[];
    },
  });

  // إنشاء طلب فسخ
  const createTerminationRequest = useMutation({
    mutationFn: async (request: {
      contract_id: string;
      requested_by: 'landlord' | 'tenant';
      termination_type: 'mutual' | 'unilateral';
      requested_date: string;
      reason: string;
    }) => {
      const { data, error } = await supabase
        .from('contract_termination_requests')
        .insert({
          ...request,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['termination-requests'] });
      toast.success('تم تقديم طلب الفسخ بنجاح');
    },
    onError: (error) => {
      console.error('Error creating termination request:', error);
      toast.error('حدث خطأ أثناء تقديم الطلب');
    },
  });

  // إنشاء طلب تعديل إيجار
  const createRentAdjustmentRequest = useMutation({
    mutationFn: async (request: {
      contract_id: string;
      requested_by: 'landlord' | 'tenant';
      adjustment_type: 'increase' | 'decrease';
      current_rent: number;
      requested_rent: number;
      reason: string;
      effective_date: string;
    }) => {
      const adjustment_percentage = 
        ((request.requested_rent - request.current_rent) / request.current_rent) * 100;

      const { data, error } = await supabase
        .from('rent_adjustment_requests')
        .insert({
          ...request,
          adjustment_percentage,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-adjustment-requests'] });
      toast.success('تم تقديم طلب تعديل الإيجار بنجاح');
    },
    onError: (error) => {
      console.error('Error creating rent adjustment request:', error);
      toast.error('حدث خطأ أثناء تقديم الطلب');
    },
  });

  // الرد على طلب فسخ
  const respondToTerminationRequest = useMutation({
    mutationFn: async ({
      id,
      status,
      response_notes,
    }: {
      id: string;
      status: 'approved' | 'rejected';
      response_notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('contract_termination_requests')
        .update({
          status,
          response_notes,
          responded_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['termination-requests'] });
      toast.success(
        data.status === 'approved'
          ? 'تمت الموافقة على طلب الفسخ'
          : 'تم رفض طلب الفسخ'
      );
    },
    onError: (error) => {
      console.error('Error responding to termination request:', error);
      toast.error('حدث خطأ أثناء الرد على الطلب');
    },
  });

  // الرد على طلب تعديل إيجار
  const respondToRentAdjustmentRequest = useMutation({
    mutationFn: async ({
      id,
      status,
      response_notes,
      final_rent,
    }: {
      id: string;
      status: 'approved' | 'rejected' | 'negotiating';
      response_notes?: string;
      final_rent?: number;
    }) => {
      const { data, error } = await supabase
        .from('rent_adjustment_requests')
        .update({
          status,
          response_notes,
          final_rent,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rent-adjustment-requests'] });
      
      const messages = {
        approved: 'تمت الموافقة على طلب تعديل الإيجار',
        rejected: 'تم رفض طلب تعديل الإيجار',
        negotiating: 'تم إرسال عرض التفاوض',
      };
      
      toast.success(messages[data.status as keyof typeof messages]);
    },
    onError: (error) => {
      console.error('Error responding to rent adjustment request:', error);
      toast.error('حدث خطأ أثناء الرد على الطلب');
    },
  });

  // إحصائيات الطلبات
  const stats = {
    terminationRequests: {
      total: terminationRequests?.length || 0,
      pending: terminationRequests?.filter((r) => r.status === 'pending').length || 0,
      approved: terminationRequests?.filter((r) => r.status === 'approved').length || 0,
      rejected: terminationRequests?.filter((r) => r.status === 'rejected').length || 0,
    },
    rentAdjustmentRequests: {
      total: rentAdjustmentRequests?.length || 0,
      pending: rentAdjustmentRequests?.filter((r) => r.status === 'pending').length || 0,
      approved: rentAdjustmentRequests?.filter((r) => r.status === 'approved').length || 0,
      rejected: rentAdjustmentRequests?.filter((r) => r.status === 'rejected').length || 0,
      negotiating: rentAdjustmentRequests?.filter((r) => r.status === 'negotiating').length || 0,
    },
  };

  return {
    terminationRequests,
    rentAdjustmentRequests,
    isLoading: isLoadingTermination || isLoadingRentAdjustment,
    refetch: () => {
      refetchTermination();
      refetchRentAdjustment();
    },
    createTerminationRequest,
    createRentAdjustmentRequest,
    respondToTerminationRequest,
    respondToRentAdjustmentRequest,
    stats,
  };
}
