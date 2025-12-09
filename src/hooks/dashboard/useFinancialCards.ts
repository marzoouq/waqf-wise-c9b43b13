/**
 * Financial Cards Data Hooks - خطافات بيانات البطاقات المالية
 * @version 2.8.35
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ==================== Bank Balance Hook ====================
export function useBankBalance() {
  return useQuery({
    queryKey: ["bank-balance-realtime"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, name_ar, code, current_balance")
        .eq("code", "1.1.1") // حساب النقدية والبنوك
        .eq("is_active", true)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });
}

// ==================== Waqf Corpus Hook ====================
interface FiscalYearCorpus {
  id: string;
  fiscal_year_id: string;
  waqf_corpus: number;
  opening_balance: number;
  closing_balance: number;
  created_at: string;
  fiscal_years: {
    name: string;
    start_date: string;
    end_date: string;
    is_closed: boolean;
  };
}

export function useWaqfCorpus() {
  return useQuery({
    queryKey: ["waqf-corpus-realtime"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_year_closings")
        .select(`
          id,
          fiscal_year_id,
          waqf_corpus,
          opening_balance,
          closing_balance,
          created_at,
          fiscal_years!inner (
            name,
            start_date,
            end_date,
            is_closed
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as FiscalYearCorpus[];
    },
  });
}

export type { FiscalYearCorpus };
