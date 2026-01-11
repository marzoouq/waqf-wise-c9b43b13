import { useQuery } from "@tanstack/react-query";
import { subDays, format, eachHourOfInterval, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { MonitoringService } from "@/services";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";
import { DASHBOARD_METRICS } from "@/lib/constants";

interface PerformanceDataPoint {
  time: string;
  responseTime: number;
  requests: number;
  cpu: number;
}

/**
 * Hook لجلب إحصائيات أداء النظام من audit_logs و system_health_checks
 * يجمع البيانات حسب الساعة لآخر 24 ساعة
 */
export function useSystemPerformanceMetrics() {
  return useQuery({
    queryKey: QUERY_KEYS.SYSTEM_PERFORMANCE_METRICS,
    queryFn: async (): Promise<PerformanceDataPoint[]> => {
      const now = new Date();
      const yesterday = subDays(now, DASHBOARD_METRICS.PERFORMANCE_LOOKBACK_DAYS);
      
      // جلب البيانات بالتوازي
      const [logs, healthData] = await Promise.all([
        MonitoringService.getPerformanceMetrics(yesterday),
        MonitoringService.getHealthCheckData(yesterday)
      ]);

      // إنشاء نقاط زمنية لكل 4 ساعات
      const hours = eachHourOfInterval({ start: yesterday, end: now })
        .filter((_, index) => index % DASHBOARD_METRICS.PERFORMANCE_HOURS_INTERVAL === 0);

      // تجميع البيانات حسب الفترة الزمنية
      const dataPoints: PerformanceDataPoint[] = hours.map((hour, index) => {
        const nextHour = hours[index + 1] || now;
        
        // عد الطلبات في هذه الفترة
        const periodLogs = (logs || []).filter(log => {
          const logDate = parseISO(log.created_at);
          return logDate >= hour && logDate < nextHour;
        });

        // حساب متوسط الأداء من health checks
        const periodHealth = (healthData || []).filter(check => {
          const checkDate = parseISO(check.created_at);
          return checkDate >= hour && checkDate < nextHour;
        });

        // استخدام بيانات audit_logs لحساب وقت الاستجابة التقريبي إذا لم توجد health checks
        let avgResponseTime = 0;
        if (periodHealth.length > 0) {
          avgResponseTime = Math.round(periodHealth.reduce((sum, h) => sum + (h.response_time_ms || 0), 0) / periodHealth.length);
        } else if (periodLogs.length > 0) {
          // تقدير وقت الاستجابة بناءً على عدد الطلبات (أكثر طلبات = وقت أبطأ)
          avgResponseTime = Math.min(500, 50 + Math.round(periodLogs.length * 2));
        }

        // نسبة CPU محسوبة من عدد الطلبات أو وقت الاستجابة
        let avgCpu = 0;
        if (periodHealth.length > 0) {
          avgCpu = Math.min(100, Math.round(avgResponseTime / 10));
        } else if (periodLogs.length > 0) {
          // تقدير استخدام CPU بناءً على عدد الطلبات
          avgCpu = Math.min(80, Math.round(periodLogs.length / 2));
        }

        return {
          time: format(hour, "HH:mm", { locale: ar }),
          responseTime: avgResponseTime,
          requests: periodLogs.length,
          cpu: avgCpu,
        };
      });

      return dataPoints;
    },
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
    refetchOnWindowFocus: QUERY_CONFIG.DEFAULT.refetchOnWindowFocus,
  });
}
