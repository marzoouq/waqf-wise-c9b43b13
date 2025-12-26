/**
 * Available Users for Messaging Hook
 * @version 2.8.66
 * 
 * يستثني المستخدم الحالي من قائمة المتاحين للمراسلة
 */

import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useAuth } from "@/contexts/AuthContext";

export interface AvailableUser {
  id: string;
  name: string;
  roles: string[];
  displayName: string;
  role: string;
}

export function useAvailableUsers() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [...QUERY_KEYS.AVAILABLE_USERS, user?.id],
    queryFn: async (): Promise<AvailableUser[]> => {
      const allUsers = await UserService.getAvailableUsers();
      // استثناء المستخدم الحالي من القائمة
      return allUsers.filter(u => u.id !== user?.id);
    },
    enabled: !!user,
  });
}
