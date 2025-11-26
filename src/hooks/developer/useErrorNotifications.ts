import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useErrorNotifications() {
  const { data: errors } = useQuery({
    queryKey: ["system-errors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000, // تحديث كل 10 ثواني
  });

  useEffect(() => {
    if (!errors || errors.length === 0) return;

    // مراقبة الأخطاء الجديدة
    const latestError = errors[0];
    const errorAge = Date.now() - new Date(latestError.created_at).getTime();
    
    // إذا كان الخطأ أحدث من 15 ثانية، أظهر إشعار
    if (errorAge < 15000 && latestError.status?.toLowerCase() !== "resolved") {
      const severity = latestError.severity?.toLowerCase();
      
      if (severity === "critical") {
        toast.error(
          `خطأ حرج: ${latestError.error_type}`,
          {
            description: latestError.error_message,
            duration: 10000,
            action: {
              label: "عرض التفاصيل",
              onClick: () => window.location.href = "/developer-tools?tab=errors"
            }
          }
        );
      } else if (severity === "error") {
        toast.warning(
          `خطأ: ${latestError.error_type}`,
          {
            description: latestError.error_message,
            duration: 5000,
          }
        );
      }
    }
  }, [errors]);

  // الاشتراك في التحديثات الفورية
  useEffect(() => {
    const channel = supabase
      .channel("error-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "system_error_logs",
        },
        (payload) => {
          const newError = payload.new as any;
          const severity = newError.severity?.toLowerCase();
          
          if (severity === "critical") {
            toast.error(
              `خطأ حرج جديد: ${newError.error_type}`,
              {
                description: newError.error_message,
                duration: 10000,
                action: {
                  label: "عرض الآن",
                  onClick: () => window.location.href = "/developer-tools?tab=errors"
                }
              }
            );
          } else if (severity === "error") {
            toast.warning(
              `خطأ جديد: ${newError.error_type}`,
              {
                description: newError.error_message,
                duration: 5000,
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { errors };
}
