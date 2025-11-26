import { Database } from '@/integrations/supabase/types';

type Loan = Database['public']['Tables']['loans']['Insert'];

export const mockRealisticLoans = (beneficiaryIds: string[]): Loan[] => [
  {
    beneficiary_id: beneficiaryIds[0],
    loan_number: 'LOAN-2024-001',
    loan_amount: 50000,
    monthly_installment: 2083,
    term_months: 24,
    start_date: '2024-01-15',
    status: 'نشط',
    remaining_balance: 29167,
  },
  {
    beneficiary_id: beneficiaryIds[1],
    loan_number: 'LOAN-2024-002',
    loan_amount: 80000,
    monthly_installment: 2222,
    term_months: 36,
    start_date: '2024-03-01',
    status: 'متعثر',
    remaining_balance: 64444,
  },
];
