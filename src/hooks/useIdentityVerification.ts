import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { handleError, showSuccess } from '@/lib/errors';
import type { Json } from '@/integrations/supabase/types';

// أنواع مساعدة لقراءة البيانات
export interface VerificationData {
  national_id?: string;
  document_type?: string;
  issue_date?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface VerificationDocument {
  id?: string;
  name: string;
  type: string;
  url?: string;
  verified?: boolean;
}

interface IdentityVerification {
  id: string;
  beneficiary_id: string;
  verification_type: string;
  verification_method: string;
  verification_status: string;
  verification_data: Json | null;
  verified_by: string | null;
  verified_at: string | null;
  expiry_date: string | null;
  notes: string | null;
  documents: Json | null;
  created_at: string;
}

// نوع الإدخال للتحقق الجديد
interface CreateVerificationInput {
  beneficiary_id: string;
  verification_type: string;
  verification_method: string;
  verification_status?: string;
  verification_data?: Json;
  verified_by?: string;
  verified_at?: string;
  expiry_date?: string;
  notes?: string;
  documents?: Json;
}

// دوال مساعدة للتحويل
export function parseVerificationData(data: Json | null): VerificationData | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return data as unknown as VerificationData;
}

export function parseVerificationDocuments(data: Json | null): VerificationDocument[] {
  if (!data || !Array.isArray(data)) return [];
  return data as unknown as VerificationDocument[];
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
        .select('id, beneficiary_id, verification_type, verification_method, verification_status, verification_data, verified_by, verified_at, expiry_date, notes, documents, created_at')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as IdentityVerification[];
    },
    enabled: !!beneficiaryId,
  });

  // إنشاء تحقق جديد
  const createVerification = useMutation({
    mutationFn: async (verification: CreateVerificationInput) => {
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
