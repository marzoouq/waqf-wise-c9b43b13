/**
 * Hook لتغيير كلمة المرور
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useChangePassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      
      // التحقق من كلمة المرور الحالية
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('User not found');
      
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      
      if (verifyError) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }
      
      // تحديث كلمة المرور
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "تم تحديث كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح",
      });

      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث كلمة المرور';
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    changePassword,
    isLoading,
  };
}
