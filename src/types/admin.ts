export interface AdminKPI {
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  totalFamilies: number;
  totalProperties: number;
  occupiedProperties: number;
  totalFunds: number;
  activeFunds: number;
  pendingRequests: number;
  overdueRequests: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export interface FinancialLine {
  debit_amount: number;
  credit_amount: number;
  accounts: {
    account_type: string;
    account_nature: string;
  } | null;
}
