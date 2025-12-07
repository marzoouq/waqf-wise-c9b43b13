/**
 * خطاف تتبع جلسة المستفيد
 * يسجل نشاط التصفح والصفحة الحالية
 */
import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UseBeneficiarySessionOptions {
  beneficiaryId?: string;
  enabled?: boolean;
}

export function useBeneficiarySession({ beneficiaryId, enabled = true }: UseBeneficiarySessionOptions) {
  const { user } = useAuth();
  const location = useLocation();
  const sessionIdRef = useRef<string | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // تحديث النشاط
  const updateActivity = useCallback(async (page: string) => {
    if (!beneficiaryId || !enabled) return;

    // تجنب التحديث المتكرر (حد أدنى 10 ثوانٍ بين التحديثات)
    const now = Date.now();
    if (now - lastUpdateRef.current < 10000) return;
    lastUpdateRef.current = now;

    try {
      if (sessionIdRef.current) {
        // تحديث الجلسة الحالية
        await supabase
          .from("beneficiary_sessions")
          .update({
            current_page: page,
            last_activity: new Date().toISOString(),
            is_online: true,
          })
          .eq("id", sessionIdRef.current);
      } else {
        // إنشاء جلسة جديدة
        const { data, error } = await supabase
          .from("beneficiary_sessions")
          .insert({
            beneficiary_id: beneficiaryId,
            user_id: user?.id,
            current_page: page,
            is_online: true,
          })
          .select("id")
          .single();

        if (!error && data) {
          sessionIdRef.current = data.id;
        }
      }
    } catch (error) {
      console.error("Error updating beneficiary session:", error);
    }
  }, [beneficiaryId, user?.id, enabled]);

  // تسجيل الخروج
  const endSession = useCallback(async () => {
    if (!sessionIdRef.current) return;

    try {
      await supabase
        .from("beneficiary_sessions")
        .update({
          is_online: false,
          last_activity: new Date().toISOString(),
        })
        .eq("id", sessionIdRef.current);
    } catch (error) {
      console.error("Error ending beneficiary session:", error);
    }
  }, []);

  // تتبع تغيير الصفحة
  useEffect(() => {
    if (enabled && beneficiaryId) {
      updateActivity(location.pathname);
    }
  }, [location.pathname, updateActivity, enabled, beneficiaryId]);

  // تسجيل الخروج عند إغلاق الصفحة
  useEffect(() => {
    if (!enabled || !beneficiaryId) return;

    const handleBeforeUnload = () => {
      endSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        endSession();
      } else if (document.visibilityState === "visible" && sessionIdRef.current) {
        updateActivity(location.pathname);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      endSession();
    };
  }, [endSession, updateActivity, location.pathname, enabled, beneficiaryId]);

  return {
    updateActivity,
    endSession,
    sessionId: sessionIdRef.current,
  };
}
