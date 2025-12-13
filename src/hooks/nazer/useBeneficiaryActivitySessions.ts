/**
 * Beneficiary Activity Sessions Hook
 * @version 2.8.86
 */

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SystemService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface BeneficiarySession {
  id: string;
  beneficiary_id: string;
  current_page: string | null;
  current_section: string | null;
  last_activity: string;
  is_online: boolean;
  session_start: string;
  beneficiary?: {
    full_name: string;
    phone: string;
    category: string;
  };
}

// ترجمة أسماء الصفحات
const PAGE_NAMES: Record<string, string> = {
  "/beneficiary-portal": "الصفحة الرئيسية",
  "/beneficiary-portal/profile": "الملف الشخصي",
  "/beneficiary-portal/distributions": "التوزيعات",
  "/beneficiary-portal/statements": "كشف الحساب",
  "/beneficiary-portal/properties": "العقارات",
  "/beneficiary-portal/family": "العائلة",
  "/beneficiary-portal/waqf": "الوقف",
  "/beneficiary-portal/governance": "الحوكمة",
  "/beneficiary-portal/budgets": "الميزانيات",
  "/beneficiary-portal/requests": "الطلبات",
  "/beneficiary-portal/documents": "المستندات",
  "/beneficiary-portal/loans": "القروض",
  "/beneficiary-dashboard": "لوحة التحكم",
};

export function getPageName(path: string | null): string {
  if (!path) return "غير محدد";
  return PAGE_NAMES[path] || path.split("/").pop() || "غير محدد";
}

export function useBeneficiaryActivitySessions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_SESSIONS_LIVE,
    queryFn: async (): Promise<BeneficiarySession[]> => {
      const data = await SystemService.getBeneficiaryActivitySessions();
      return data as BeneficiarySession[];
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  // الاشتراك في التحديثات المباشرة
  useEffect(() => {
    const channel = supabase
      .channel("beneficiary-sessions-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "beneficiary_sessions",
        },
        () => {
          // استخدام invalidateQueries بدلاً من refetch لتجنب إعادة التصيير غير الضرورية
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY_SESSIONS_LIVE });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const sessions = query.data || [];

  // تحديد المتصلين حالياً (نشاط خلال آخر 5 دقائق)
  const onlineSessions = sessions.filter(s => {
    const lastActivity = new Date(s.last_activity);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastActivity > fiveMinutesAgo && s.is_online;
  });

  const offlineSessions = sessions.filter(s => {
    const lastActivity = new Date(s.last_activity);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastActivity <= fiveMinutesAgo || !s.is_online;
  });

  return {
    ...query,
    sessions,
    onlineSessions,
    offlineSessions,
  };
}
