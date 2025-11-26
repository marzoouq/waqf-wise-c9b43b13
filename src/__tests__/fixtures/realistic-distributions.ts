import { Database } from '@/integrations/supabase/types';

type Distribution = Database['public']['Tables']['distributions']['Insert'];

export const mockRealisticDistributions = (): Distribution[] => [
  {
    month: '2025-03',
    distribution_date: '2025-03-31',
    total_amount: 168000,
    beneficiaries_count: 14,
    status: 'معتمد',
    waqf_name: 'وقف الثبيتي الخيري',
  },
  {
    month: '2025-06',
    distribution_date: '2025-06-30',
    total_amount: 168000,
    beneficiaries_count: 14,
    status: 'معلق',
    waqf_name: 'وقف الثبيتي الخيري',
  },
];

export const mockDistributionDetails = (distributionId: string, beneficiaryIds: string[]) => {
  return beneficiaryIds.map((beneficiaryId, index) => ({
    distribution_id: distributionId,
    beneficiary_id: beneficiaryId,
    allocated_amount: index === 0 ? 20000 : 10000,
    payment_status: 'معلق',
  }));
};
