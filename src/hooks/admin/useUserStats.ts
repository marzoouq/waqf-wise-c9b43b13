/**
 * useUserStats Hook
 * جلب إحصائيات المستخدمين للوحة المشرف
 */

import { useQuery } from "@tanstack/react-query";
import { UserService, UserStats } from "@/services/user.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export { type UserStats } from "@/services/user.service";

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: QUERY_KEYS.USER_STATS,
    queryFn: () => UserService.getUserStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
  });
}
