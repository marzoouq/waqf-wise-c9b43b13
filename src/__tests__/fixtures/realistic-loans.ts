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
  },
  {
    beneficiary_id: beneficiaryIds[1],
    loan_number: 'LOAN-2024-002',
    loan_amount: 80000,
    monthly_installment: 2222,
    term_months: 36,
    start_date: '2024-03-01',
    status: 'متعثر',
  },
  {
    beneficiary_id: beneficiaryIds[2],
    loan_number: 'LOAN-2024-003',
    loan_amount: 30000,
    monthly_installment: 1500,
    term_months: 20,
    start_date: '2023-06-01',
    status: 'مسدد',
  },
];
