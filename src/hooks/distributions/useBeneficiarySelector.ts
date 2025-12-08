/**
 * Hook لاختيار المستفيدين
 * Beneficiary Selector Hook
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import { BeneficiarySelectorItem } from '@/types/beneficiary';

export function useBeneficiarySelector() {
  const [beneficiaries, setBeneficiaries] = useState<BeneficiarySelectorItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const loadBeneficiaries = async () => {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, full_name, national_id, category')
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (error) {
      productionLogger.error('Error loading beneficiaries', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBeneficiaries = (searchTerm: string) => {
    return beneficiaries.filter(b =>
      b.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.national_id.includes(searchTerm)
    );
  };

  return {
    beneficiaries,
    loading,
    filterBeneficiaries,
    refetch: loadBeneficiaries,
  };
}
