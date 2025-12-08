/**
 * Hook لإعادة تعيين كلمة المرور
 * Reset Password Hook
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateSecurePassword } from '@/lib/beneficiaryAuth';
import { productionLogger } from '@/lib/logger/production-logger';

interface BeneficiaryInfo {
  id: string;
  full_name: string;
  national_id: string;
  user_id?: string | null;
}

export function useResetPassword(beneficiary: BeneficiaryInfo, onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const generateRandomPassword = () => {
    setNewPassword(generateSecurePassword());
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (!beneficiary.user_id) {
      toast.error('المستفيد لا يملك حساب مفعل');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        'admin-manage-beneficiary-password',
        {
          body: {
            action: 'reset-password',
            beneficiaryId: beneficiary.id,
            newPassword: newPassword,
          },
        }
      );

      if (error) {
        productionLogger.warn('Error resetting password:', error);
        toast.error('فشل إعادة تعيين كلمة المرور', {
          description: error.message || 'حدث خطأ غير متوقع',
        });
        setIsLoading(false);
        return;
      }

      if (import.meta.env.DEV) productionLogger.debug('Password reset successful', data);
      toast.success('تم إعادة تعيين كلمة المرور بنجاح');
      setIsSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      productionLogger.warn('Error:', error);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('تم النسخ إلى الحافظة');
    } catch {
      toast.error('فشل النسخ');
    }
  };

  const reset = () => {
    setNewPassword('');
    setShowPassword(false);
    setIsSuccess(false);
  };

  return {
    isLoading,
    newPassword,
    setNewPassword,
    showPassword,
    setShowPassword,
    isSuccess,
    generateRandomPassword,
    handleResetPassword,
    copyToClipboard,
    reset,
  };
}
