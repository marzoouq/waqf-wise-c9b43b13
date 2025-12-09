/**
 * useTwoFactorAuth Hook
 * إدارة المصادقة الثنائية
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";

export function useTwoFactorAuth(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: twoFactorData, isLoading } = useQuery({
    queryKey: ["two-factor-status", userId],
    queryFn: async () => {
      if (!userId) return null;
      return AuthService.get2FAStatus(userId);
    },
    enabled: !!userId,
  });

  const invalidate2FAStatus = async () => {
    await queryClient.invalidateQueries({ queryKey: ["two-factor-status"] });
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  return {
    twoFactorEnabled: twoFactorData?.enabled || false,
    twoFactorData,
    isLoading,
    invalidate2FAStatus,
  };
}
