import { Database } from '@/integrations/supabase/types';

type Loan = Database['public']['Tables']['loans']['Insert'];

export const mockLoan = (beneficiaryId: string, overrides?: Partial<Loan>): Loan => ({
  beneficiary_id: beneficiaryId,
  loan_number: 'LOAN-2024-001',
  loan_amount: 30000,
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  monthly_installment: 1000,
  remaining_balance: 25000,
  status: 'active',
  ...overrides,
});

export const mockLoans = (beneficiaryIds: string[], count: number = 10): Loan[] => {
  const statuses = ['active', 'completed', 'defaulted', 'pending'];
  const types = ['قرض حسن', 'قرض إنتاجي', 'قرض تعليمي', 'قرض علاجي'];
  const purposes = [
    'شراء سيارة للعمل',
    'بدء مشروع صغير',
    'تكاليف الدراسة الجامعية',
    'علاج أحد أفراد العائلة',
    'تجديد المنزل',
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const loanAmount = 20000 + (i * 5000);
    const totalInstallments = 24 + (i * 6);
    const paidInstallments = i * 2;
    const installmentAmount = Math.floor(loanAmount / totalInstallments);
    const remainingAmount = loanAmount - (installmentAmount * paidInstallments);
    
    return mockLoan(
      beneficiaryIds[i % beneficiaryIds.length],
      { 
        loan_number: `LOAN-2024-${String(i + 1).padStart(3, '0')}`,
        loan_amount: loanAmount,
        start_date: `2024-${String((i % 12) + 1).padStart(2, '0')}-01`,
        monthly_installment: installmentAmount,
        remaining_balance: remainingAmount,
        status: statuses[i % statuses.length],
      }
    );
  });
};
