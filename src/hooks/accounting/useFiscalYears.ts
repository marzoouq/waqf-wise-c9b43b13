import { useQuery } from "@tanstack/react-query";
import { FiscalYearService } from "@/services/fiscal-year.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface FiscalYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_closed: boolean;
  is_published: boolean;
  published_at: string | null;
  published_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useFiscalYears() {
  const { data: fiscalYears = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.FISCAL_YEARS,
    queryFn: () => FiscalYearService.getAll(),
  });

  return {
    fiscalYears,
    isLoading,
  };
}
