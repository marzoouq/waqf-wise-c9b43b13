import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FiscalYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export function useFiscalYears() {
  const { data: fiscalYears = [], isLoading } = useQuery({
    queryKey: ["fiscal_years"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return (data || []) as FiscalYear[];
    },
  });

  return {
    fiscalYears,
    isLoading,
  };
}
