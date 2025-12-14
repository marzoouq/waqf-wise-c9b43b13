import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services/beneficiary.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface BeneficiaryCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useBeneficiaryCategories() {
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_CATEGORIES,
    queryFn: () => BeneficiaryService.getCategories(),
  });

  const activeCategories = categories.filter(c => c.is_active);

  return {
    categories,
    activeCategories,
    isLoading,
    error,
    refetch,
  };
}
