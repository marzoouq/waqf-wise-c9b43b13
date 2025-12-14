/**
 * useTwoFactorAuth Hook
 * إدارة المصادقة الثنائية
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useTwoFactorAuth(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: twoFactorData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.TWO_FACTOR_STATUS(userId),
    queryFn: async () => {
      if (!userId) return null;
      return AuthService.get2FAStatus(userId);
    },
    enabled: !!userId,
  });

  const invalidate2FAStatus = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TWO_FACTOR_STATUS(userId) });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE(userId) });
  };

  return {
    twoFactorEnabled: twoFactorData?.enabled || false,
    twoFactorData,
    isLoading,
    invalidate2FAStatus,
  };
}
