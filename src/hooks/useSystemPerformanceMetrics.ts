import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, format, eachHourOfInterval, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

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
      
      // جلب سجلات النشاط لآخر 24 ساعة
      const { data: logs, error } = await supabase
        .from("audit_logs")
        .select("created_at, action_type")
        .gte("created_at", yesterday.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching performance metrics:", error);
        throw error;
      }

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
        
        // محاكاة وقت الاستجابة بناءً على عدد الطلبات (كلما زادت الطلبات زاد وقت الاستجابة)
        const baseResponseTime = 100;
        const responseTime = Math.min(baseResponseTime + (requests * 2), 500);
        
        // محاكاة استخدام CPU بناءً على الطلبات
        const baseCpu = 20;
        const cpu = Math.min(baseCpu + (requests * 0.5), 95);

        return {
          time: format(hour, "HH:mm", { locale: ar }),
          responseTime: Math.round(responseTime),
          requests,
          cpu: Math.round(cpu),
        };
      });

      return dataPoints;
    },
    staleTime: 5 * 60 * 1000, // 5 دقائق
    refetchInterval: 5 * 60 * 1000, // تحديث كل 5 دقائق
  });
}
