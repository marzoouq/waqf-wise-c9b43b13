/**
 * useJournalEntriesList Hook
 * Hook لقائمة القيود المحاسبية
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type JournalEntry = {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  status: string;
  posted_at: string | null;
  created_at: string;
};

export function useJournalEntriesList() {
  const { data: entries, isLoading, error, refetch } = useQuery({
    queryKey: ["journal_entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("entry_date", { ascending: false });
      if (error) throw error;
      return data as JournalEntry[];
    },
  });

  return {
    entries: entries || [],
    isLoading,
    error,
    refetch,
  };
}
