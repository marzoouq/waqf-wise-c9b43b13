import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SystemHealth {
  database: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    connections: number;
  };
  storage: {
    status: 'healthy' | 'degraded' | 'down';
    usedSpace: number;
    totalSpace: number;
  };
  uptime: {
    days: number;
    hours: number;
    minutes: number;
  };
  performance: {
    avgResponseTime: number;
    requestsPerMinute: number;
  };
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: async (): Promise<SystemHealth> => {
      const startTime = Date.now();
      
      // تنفيذ جميع الاستعلامات بالتوازي
      const [dbTestResult, storageResult, healthChecksResult] = await Promise.all([
        // اختبار الاتصال بقاعدة البيانات
        supabase.from("activities").select("id").limit(1),
        // الحصول على إحصائيات التخزين
        supabase.from("beneficiary_attachments").select("file_size"),
        // جلب آخر فحص صحة من قاعدة البيانات
        supabase
          .from("system_health_checks")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const responseTime = Date.now() - startTime;
      const dbError = dbTestResult.error;
      const storageData = storageResult.data;
      const healthCheck = healthChecksResult.data;

      const totalUsed = storageData?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;

      // حساب وقت التشغيل من آخر فحص صحة
      let uptimeDays = 0, uptimeHours = 0, uptimeMinutes = 0;
      if (healthCheck?.created_at) {
        const firstCheckTime = new Date(healthCheck.created_at);
        const now = new Date();
        const diffMs = now.getTime() - firstCheckTime.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        uptimeDays = Math.floor(diffMinutes / 1440);
        uptimeHours = Math.floor((diffMinutes % 1440) / 60);
        uptimeMinutes = diffMinutes % 60;
      }

      return {
        database: {
          status: dbError ? 'down' : responseTime < 100 ? 'healthy' : 'degraded',
          responseTime,
          connections: 0,
        },
        storage: {
          status: 'healthy',
          usedSpace: totalUsed,
          totalSpace: 10 * 1024 * 1024 * 1024, // 10GB افتراضي
        },
        uptime: {
          days: uptimeDays,
          hours: uptimeHours,
          minutes: uptimeMinutes,
        },
        performance: {
          avgResponseTime: healthCheck?.response_time_ms || responseTime,
          requestsPerMinute: 0,
        },
      };
    },
    refetchInterval: 5 * 60 * 1000, // كل 5 دقائق
    staleTime: 2 * 60 * 1000, // 2 دقائق
  });
}
