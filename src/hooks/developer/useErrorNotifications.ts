import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useErrorNotifications(enabled: boolean = true) {
  // تتبع الأخطاء التي تم عرضها لتجنب التكرار
  const shownErrorsRef = useRef<Set<string>>(new Set());
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
    refetchInterval: enabled ? 10000 : false, // تحديث كل 10 ثواني فقط عند التفعيل
    enabled,
  });

  useEffect(() => {
    if (!enabled || !errors || errors.length === 0) return;

    // مراقبة الأخطاء الجديدة
    const latestError = errors[0];
    const errorAge = Date.now() - new Date(latestError.created_at).getTime();
    
    // تجاهل الأخطاء التي تم عرضها مسبقاً
    if (shownErrorsRef.current.has(latestError.id)) return;
    
    // إذا كان الخطأ أحدث من 30 ثانية، أظهر إشعار
    if (errorAge < 30000 && latestError.status?.toLowerCase() !== "resolved") {
      shownErrorsRef.current.add(latestError.id);
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
  }, [errors, enabled]);

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
          
          // تجاهل الأخطاء المكررة
          if (shownErrorsRef.current.has(newError.id)) return;
          shownErrorsRef.current.add(newError.id);
          
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
