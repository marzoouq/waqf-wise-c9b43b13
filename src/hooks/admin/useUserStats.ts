/**
 * useUserStats Hook
 * جلب إحصائيات المستخدمين للوحة المشرف
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  recentUsers: Array<{
    id: string;
    email: string;
    created_at: string;
    last_login_at?: string;
  }>;
}

export function useUserStats() {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: async (): Promise<UserStats> => {
      // جلب البيانات بالتوازي باستخدام Promise.all
      const [usersResponse, profilesResponse] = await Promise.all([
        // جلب المستخدمين من user_roles
        supabase
          .from("user_roles")
          .select("user_id, role, created_at")
          .order("created_at", { ascending: false })
          .limit(100),
        
        // جلب آخر 5 مستخدمين من profiles
        supabase
          .from("profiles")
          .select("id, email, created_at, last_login_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (usersResponse.error) throw usersResponse.error;
      if (profilesResponse.error) throw profilesResponse.error;

      const usersData = usersResponse.data || [];
      const profilesData = profilesResponse.data || [];

      // حساب الإحصائيات
      const uniqueUsers = new Set(usersData.map(u => u.user_id));
      const adminUsers = usersData.filter(u => u.role === 'admin');

      const recentUsers = profilesData.map(user => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        last_login_at: user.last_login_at,
      }));

      return {
        totalUsers: uniqueUsers.size,
        activeUsers: recentUsers.filter(u => u.last_login_at).length,
        adminCount: new Set(adminUsers.map(u => u.user_id)).size,
        recentUsers,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
  });
}
