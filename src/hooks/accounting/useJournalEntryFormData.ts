/**
 * Journal Entry Form Data Hook
 * @version 2.8.39
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useJournalEntryAccounts() {
  return useQuery({
    queryKey: ["journal-entry-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("is_active", true)
        .eq("is_header", false)
        .order("code");
      if (error) throw error;
      return data;
    },
  });
}

export function useActiveFiscalYears() {
  return useQuery({
    queryKey: ["active-fiscal-years"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
