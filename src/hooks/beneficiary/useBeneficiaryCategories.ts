import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services/beneficiary.service";

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
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["beneficiary-categories"],
    queryFn: () => BeneficiaryService.getCategories(),
  });

  const activeCategories = categories.filter(c => c.is_active);

  return {
    categories,
    activeCategories,
    isLoading,
  };
}
