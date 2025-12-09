/**
 * Hook لاختيار المستفيدين
 * @version 2.8.55
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/lib/query-keys';
import { BeneficiarySelectorItem } from '@/types/beneficiary';

export function useBeneficiarySelector() {
  const { data: beneficiaries = [], isLoading: loading, refetch } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_SELECTOR,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, full_name, national_id, category')
        .eq('status', 'active')
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
  });

  const filterBeneficiaries = (searchTerm: string) => {
    return beneficiaries.filter((b: BeneficiarySelectorItem) =>
      b.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || b.national_id.includes(searchTerm)
    );
  };

  return { beneficiaries, loading, filterBeneficiaries, refetch };
}
