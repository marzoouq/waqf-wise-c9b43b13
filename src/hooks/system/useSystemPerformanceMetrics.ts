import { useQuery } from "@tanstack/react-query";
import { startOfDay, subDays, format, eachHourOfInterval, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { MonitoringService } from "@/services";

interface PerformanceDataPoint {
  time: string;
  responseTime: number;
  requests: number;
  cpu: number;
}

/**
 * Hook لجلب إحصائيات أداء النظام من audit_logs
 * يجمع البيانات حسب الساعة لآخر 24 ساعة
 */
export function useSystemPerformanceMetrics() {
  return useQuery({
    queryKey: ["system-performance-metrics"],
    queryFn: async (): Promise<PerformanceDataPoint[]> => {
      const now = new Date();
      const yesterday = subDays(now, 1);
      
      const logs = await MonitoringService.getPerformanceMetrics(yesterday);

      // إنشاء نقاط زمنية لكل 4 ساعات
      const hours = eachHourOfInterval({ start: yesterday, end: now })
        .filter((_, index) => index % 4 === 0);

      // تجميع البيانات حسب الفترة الزمنية
      const dataPoints: PerformanceDataPoint[] = hours.map((hour, index) => {
        const nextHour = hours[index + 1] || now;
        
        // عد الطلبات في هذه الفترة
        const periodLogs = (logs || []).filter(log => {
          const logDate = parseISO(log.created_at);
          return logDate >= hour && logDate < nextHour;
        });

        const requests = periodLogs.length;

        return {
          time: format(hour, "HH:mm", { locale: ar }),
          responseTime: 0,
          requests,
          cpu: 0,
        };
      });

      return dataPoints;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
  });
}
