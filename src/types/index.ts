// Core Entity Types
export interface Beneficiary {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  email?: string;
  family_name?: string;
  relationship?: string;
  category: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  units: number;
  occupied: number;
  monthly_revenue: number;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  payment_type: "receipt" | "payment";
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "cheque" | "card";
  payer_name: string;
  reference_number?: string;
  description: string;
  notes?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Distribution {
  id: string;
  month: string;
  total_amount: number;
  beneficiaries_count: number;
  status: string;
  distribution_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: "draft" | "sent" | "paid" | "cancelled";
  notes?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter Types
export interface FilterParams {
  searchQuery?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
}

// Common Component Props
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface EntityDialogProps<T> extends DialogProps {
  entity?: T | null;
  onSubmit: (data: T) => Promise<void>;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expense: number;
}

export interface AccountData {
  name: string;
  amount: number;
  percentage?: number;
}
