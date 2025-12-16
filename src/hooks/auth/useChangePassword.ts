/**
 * Hook لتغيير كلمة المرور
 * @version 2.8.60
 */
import { useState } from "react";
import { useToast } from "@/hooks/ui/use-toast";
import { AuthService } from "@/services";

interface ChangePasswordResult {
  success: boolean;
  error?: string;
}

export function useChangePassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<ChangePasswordResult> => {
    setIsLoading(true);
    try {
      const result = await AuthService.changePassword(currentPassword, newPassword);
      
      if (!result.success) {
        toast({
          title: "خطأ",
          description: result.error || 'حدث خطأ أثناء تحديث كلمة المرور',
          variant: "destructive",
        });
        return result;
      }

      toast({
        title: "تم تحديث كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح",
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث كلمة المرور';
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    changePassword,
    isLoading,
  };
}
