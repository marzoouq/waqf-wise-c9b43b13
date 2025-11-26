import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { handleError, showSuccess } from '@/lib/errors';

interface IdentityVerification {
  id: string;
  beneficiary_id: string;
  verification_type: string;
  verification_method: string;
  verification_status: string;
  verification_data: any;
  verified_by: string | null;
  verified_at: string | null;
  expiry_date: string | null;
  notes: string | null;
  documents: any;
  created_at: string;
}

/**
 * Hook لإدارة التحقق من الهوية - المرحلة 2
 */
export function useIdentityVerification(beneficiaryId: string) {
  const queryClient = useQueryClient();

  // جلب سجل التحقق
  const { data: verifications = [], isLoading } = useQuery({
    queryKey: ['identity-verifications', beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('identity_verifications')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as IdentityVerification[];
    },
    enabled: !!beneficiaryId,
  });

  // إنشاء تحقق جديد
  const createVerification = useMutation({
    mutationFn: async (verification: Omit<IdentityVerification, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('identity_verifications')
        .insert([verification])
        .select()
        .single();

      if (error) throw error;

      // تحديث حالة المستفيد
      await supabase
        .from('beneficiaries')
        .update({
          verification_status: verification.verification_status,
          last_verification_date: new Date().toISOString(),
        })
        .eq('id', beneficiaryId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-verifications', beneficiaryId] });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      showSuccess('تم التحقق', 'تم التحقق من الهوية بنجاح');
    },
    onError: (error: unknown) => {
      handleError(error, { context: { operation: 'verify_identity' } });
    },
  });

  const latestVerification = verifications[0] || null;

  return {
    verifications,
    latestVerification,
    isLoading,
    createVerification: createVerification.mutateAsync,
    isVerifying: createVerification.isPending,
  };
}
