/**
 * Hook لتغيير كلمة المرور
 */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChangePasswordResult {
  success: boolean;
  error?: string;
}

export function useChangePassword() {
  const [isLoading, setIsLoading] = useState(false);

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<ChangePasswordResult> => {
    setIsLoading(true);
    try {
      // Step 1: Verify current password by attempting sign in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { success: false, error: 'User not found' };
      }
      
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      
      if (verifyError) {
        return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
      }
      
      // Step 2: Update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث كلمة المرور' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    changePassword,
    isLoading,
  };
}
