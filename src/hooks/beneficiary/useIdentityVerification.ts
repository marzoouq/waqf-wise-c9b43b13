/**
 * Hook للتحقق من الهوية
 * @version 2.8.55
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Beneficiary } from '@/types/beneficiary';
import { QUERY_KEYS } from '@/lib/query-keys';

interface VerificationFormData {
  verification_type: string;
  verification_method: string;
  verification_status: string;
  notes: string;
}

export function useIdentityVerification(beneficiary: Beneficiary | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<VerificationFormData>({
    verification_type: 'identity_card',
    verification_method: 'manual',
    verification_status: 'pending',
    notes: '',
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!beneficiary) throw new Error('لا يوجد مستفيد محدد');

      await supabase.from('identity_verifications').insert({
        beneficiary_id: beneficiary.id,
        ...formData,
        verified_by: (await supabase.auth.getUser()).data.user?.id,
        verified_at: new Date().toISOString(),
      });

      await supabase.from('beneficiaries').update({
        verification_status: formData.verification_status,
        verification_method: formData.verification_method,
        last_verification_date: new Date().toISOString(),
        verification_notes: formData.notes,
      }).eq('id', beneficiary.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY(beneficiary?.id || '') });
      toast({ title: 'تم التحقق بنجاح', description: 'تم التحقق من هوية المستفيد وتحديث البيانات' });
    },
    onError: (error: Error) => {
      toast({ title: 'خطأ في التحقق', description: error.message || 'فشل التحقق من الهوية', variant: 'destructive' });
    },
  });

  const updateFormData = (updates: Partial<VerificationFormData>) => setFormData(prev => ({ ...prev, ...updates }));
  const resetForm = () => setFormData({ verification_type: 'identity_card', verification_method: 'manual', verification_status: 'pending', notes: '' });

  return { formData, updateFormData, resetForm, verify: verifyMutation.mutate, isVerifying: verifyMutation.isPending };
}
