import { useQuery } from "@tanstack/react-query";
import { subDays, format, eachDayOfInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { ar } from "date-fns/locale";
import { MonitoringService } from "@/services";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

interface UserActivityDataPoint {
  day: string;
  activeUsers: number;
  newUsers: number;
  logins: number;
}

/**
 * Hook لجلب إحصائيات نشاط المستخدمين لآخر 7 أيام
 * محسّن باستخدام Promise.all للاستعلامات المتوازية
 */
export function useUsersActivityMetrics() {
  return useQuery({
    queryKey: QUERY_KEYS.USERS_ACTIVITY_METRICS,
    queryFn: async (): Promise<UserActivityDataPoint[]> => {
      const now = new Date();
      const weekAgo = subDays(now, 7);
      
      const { loginAttempts, newProfiles, activities } = await MonitoringService.getUserActivityMetrics(weekAgo);

      // إنشاء نقاط البيانات لكل يوم
      const days = eachDayOfInterval({ start: weekAgo, end: now });
      
      const dataPoints: UserActivityDataPoint[] = days.slice(0, 7).map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        
        // عد عمليات الدخول الناجحة في هذا اليوم
        const dayLogins = loginAttempts.filter(attempt => {
          const attemptDate = parseISO(attempt.created_at);
          return attemptDate >= dayStart && attemptDate <= dayEnd && attempt.success;
        }).length;

        // عد المستخدمين الجدد في هذا اليوم
        const dayNewUsers = newProfiles.filter(profile => {
          const profileDate = parseISO(profile.created_at);
          return profileDate >= dayStart && profileDate <= dayEnd;
        }).length;

        // عد المستخدمين النشطين (المستخدمين الفريدين الذين لديهم نشاط)
        const uniqueActiveUsers = new Set(
          activities
            .filter(activity => {
              const activityDate = parseISO(activity.timestamp);
              return activityDate >= dayStart && activityDate <= dayEnd;
            })
            .map(a => a.user_name)
        ).size;

        return {
          day: format(day, "EEEE", { locale: ar }),
          activeUsers: uniqueActiveUsers,
          newUsers: dayNewUsers,
          logins: dayLogins,
        };
      });

      return dataPoints;
    },
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
    refetchOnWindowFocus: QUERY_CONFIG.DEFAULT.refetchOnWindowFocus,
  });
}
