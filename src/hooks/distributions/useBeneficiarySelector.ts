/**
 * Hook لاختيار المستفيدين
 * @version 2.8.68
 */

import { useQuery } from '@tanstack/react-query';
import { DistributionService } from '@/services';
import { QUERY_KEYS } from '@/lib/query-keys';
import { BeneficiarySelectorItem } from '@/types/beneficiary';

export function useBeneficiarySelector() {
  const { data: beneficiaries = [], isLoading: loading, refetch } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_SELECTOR,
    queryFn: () => DistributionService.getBeneficiariesForSelector(),
  });

  const filterBeneficiaries = (searchTerm: string) => {
    return beneficiaries.filter((b: BeneficiarySelectorItem) =>
      b.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || b.national_id.includes(searchTerm)
    );
  };

  return { beneficiaries, loading, filterBeneficiaries, refetch };
}
