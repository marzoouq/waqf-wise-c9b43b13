/**
 * Hook لإدارة نماذج استلام/تسليم الوحدات
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UnitHandover {
  id: string;
  contract_id: string;
  handover_type: string;
  handover_date: string;
  electricity_meter_reading: number | null;
  water_meter_reading: number | null;
  gas_meter_reading: number | null;
  keys_count: number | null;
  parking_cards_count: number | null;
  access_cards_count: number | null;
  remote_controls_count: number | null;
  general_condition: string | null;
  cleanliness: string | null;
  condition_notes: string | null;
  witness_name: string | null;
  notes: string | null;
  landlord_signature: string | null;
  tenant_signature: string | null;
  witness_signature: string | null;
  created_at: string;
  created_by: string | null;
  created_by_name: string | null;
}

export function useUnitHandovers(contractId?: string) {
  const queryClient = useQueryClient();

  // جلب جميع نماذج الاستلام لعقد معين
  const {
    data: handovers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['unit-handovers', contractId],
    queryFn: async () => {
      let query = supabase
        .from('unit_handovers')
        .select('*')
        .order('handover_date', { ascending: false });

      if (contractId) {
        query = query.eq('contract_id', contractId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UnitHandover[];
    },
    enabled: !!contractId || contractId === undefined,
  });

  // إضافة نموذج استلام جديد
  const addHandover = useMutation({
    mutationFn: async (handover: {
      contract_id: string;
      handover_type: string;
      handover_date: string;
      electricity_meter_reading?: number | null;
      water_meter_reading?: number | null;
      gas_meter_reading?: number | null;
      keys_count?: number | null;
      parking_cards_count?: number | null;
      access_cards_count?: number | null;
      remote_controls_count?: number | null;
      general_condition?: string | null;
      cleanliness?: string | null;
      condition_notes?: string | null;
      witness_name?: string | null;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('unit_handovers')
        .insert(handover)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-handovers'] });
      toast.success('تم حفظ نموذج الاستلام بنجاح');
    },
    onError: (error) => {
      console.error('Error adding handover:', error);
      toast.error('حدث خطأ أثناء حفظ النموذج');
    },
  });

  // تحديث نموذج استلام
  const updateHandover = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<UnitHandover> & { id: string }) => {
      const { data, error } = await supabase
        .from('unit_handovers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-handovers'] });
      toast.success('تم تحديث النموذج بنجاح');
    },
    onError: (error) => {
      console.error('Error updating handover:', error);
      toast.error('حدث خطأ أثناء تحديث النموذج');
    },
  });

  // أرشفة نموذج استلام (Soft Delete)
  const deleteHandover = useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('unit_handovers')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.user?.id || null,
          deletion_reason: 'حذف بواسطة المستخدم'
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-handovers'] });
      toast.success('تم أرشفة النموذج بنجاح');
    },
    onError: (error) => {
      console.error('Error archiving handover:', error);
      toast.error('حدث خطأ أثناء أرشفة النموذج');
    },
  });

  // تحديث التوقيعات
  const updateSignature = useMutation({
    mutationFn: async ({
      id,
      signatureType,
      signed,
    }: {
      id: string;
      signatureType: 'landlord' | 'tenant';
      signed: boolean;
    }) => {
      const field =
        signatureType === 'landlord'
          ? 'landlord_signature'
          : 'tenant_signature';

      const { data, error } = await supabase
        .from('unit_handovers')
        .update({ [field]: signed })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-handovers'] });
      toast.success('تم تحديث التوقيع');
    },
    onError: (error) => {
      console.error('Error updating signature:', error);
      toast.error('حدث خطأ أثناء تحديث التوقيع');
    },
  });

  // جلب آخر نموذج استلام لعقد
  const getLatestHandover = (type: 'تسليم' | 'استلام') => {
    if (!handovers) return null;
    return handovers.find((h) => h.handover_type === type);
  };

  return {
    handovers,
    isLoading,
    error,
    refetch,
    addHandover,
    updateHandover,
    deleteHandover,
    updateSignature,
    getLatestHandover,
    deliveryHandover: getLatestHandover('تسليم'),
    receivingHandover: getLatestHandover('استلام'),
  };
}
