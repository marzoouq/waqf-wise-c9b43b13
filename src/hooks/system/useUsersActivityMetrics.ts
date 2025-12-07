import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, eachDayOfInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { ar } from "date-fns/locale";

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
    queryKey: ["users-activity-metrics"],
    queryFn: async (): Promise<UserActivityDataPoint[]> => {
      const now = new Date();
      const weekAgo = subDays(now, 7);
      
      // جلب جميع البيانات بالتوازي باستخدام Promise.all
      const [loginAttemptsResponse, newProfilesResponse, activitiesResponse] = await Promise.all([
        // جلب محاولات تسجيل الدخول
        supabase
          .from("login_attempts_log")
          .select("created_at, success, user_email")
          .gte("created_at", weekAgo.toISOString())
          .order("created_at", { ascending: true }),
        
        // جلب المستخدمين الجدد (من profiles)
        supabase
          .from("profiles")
          .select("created_at")
          .gte("created_at", weekAgo.toISOString()),
        
        // جلب الأنشطة لتحديد المستخدمين النشطين
        supabase
          .from("activities")
          .select("timestamp, user_name")
          .gte("timestamp", weekAgo.toISOString()),
      ]);

      // التعامل مع الأخطاء
      if (loginAttemptsResponse.error) {
        console.error("Error fetching login attempts:", loginAttemptsResponse.error);
      }
      if (newProfilesResponse.error) {
        console.error("Error fetching new profiles:", newProfilesResponse.error);
      }
      if (activitiesResponse.error) {
        console.error("Error fetching activities:", activitiesResponse.error);
      }

      const loginAttempts = loginAttemptsResponse.data || [];
      const newProfiles = newProfilesResponse.data || [];
      const activities = activitiesResponse.data || [];

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
    staleTime: 5 * 60 * 1000, // 5 دقائق
    refetchInterval: false, // تعطيل التحديث التلقائي لتحسين LCP
  });
}
