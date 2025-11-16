/**
 * Dashboard Types
 * Comprehensive type definitions for dashboard components
 */

// ============= Nazer Dashboard Types =============

export interface PropertyPerformance {
  name: string;
  'الإيرادات الكلية': number;
  'المدفوع': number;
  'المعلق': number;
}

export interface RevenueDistribution {
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number;
}

export interface PendingApproval {
  id: string;
  type: 'distribution' | 'request' | 'journal' | 'payment';
  title: string;
  amount?: number;
  date: Date;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export interface SmartAlert {
  id: string;
  type: 'contract_expiring' | 'rent_overdue' | 'loan_due' | 'request_overdue';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: Date;
  actionUrl: string;
}

export interface NazerKPI {
  totalAssets: number;
  totalRevenue: number;
  activeBeneficiaries: number;
  activeProperties: number;
  occupiedProperties: number;
  pendingLoans: number;
  availableBudget: number;
  monthlyReturn: number;
}

// ============= Charts Types =============

export interface AccountDistribution {
  name: string;
  value: number;
  count: number;
}

export interface BudgetComparison {
  account: string;
  budgeted: number;
  actual: number;
  variance: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expense: number;
}

// ============= Common Dashboard Types =============

export interface DashboardStats {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description?: string;
  format?: 'currency' | 'number' | 'percentage';
}

export interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  path: string;
}

// ============= Archivist Dashboard Types =============

export interface ArchiveStats {
  totalDocuments: number;
  totalFolders: number;
  totalSize: number;
}

export interface RecentDocument {
  id: string;
  name: string;
  category: string;
  uploaded_at: string;
  file_size: string;
  folders?: {
    name: string;
  } | null;
}

// ============= Beneficiary Dashboard Types =============

export interface BeneficiaryPayment {
  id: string;
  amount: number;
  date: string;
  type: string;
  status: string;
  description?: string;
}
