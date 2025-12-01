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
      
      // اختبار الاتصال بقاعدة البيانات
      const { error: dbError } = await supabase
        .from("activities")
        .select("id")
        .limit(1);

      const responseTime = Date.now() - startTime;

      // الحصول على إحصائيات التخزين (محاكاة)
      const { data: storageData } = await supabase
        .from("beneficiary_attachments")
        .select("file_size");

      const totalUsed = storageData?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;

      return {
        database: {
          status: dbError ? 'down' : responseTime < 100 ? 'healthy' : 'degraded',
          responseTime,
          connections: 0, // غير متوفر
        },
        storage: {
          status: 'healthy',
          usedSpace: totalUsed,
          totalSpace: 0, // غير متوفر
        },
        uptime: {
          days: 0,
          hours: 0,
          minutes: 0,
        },
        performance: {
          avgResponseTime: responseTime,
          requestsPerMinute: 0, // غير متوفر
        },
      };
    },
    refetchInterval: false, // Disabled
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
