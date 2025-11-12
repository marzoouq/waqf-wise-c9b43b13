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

// Family Management Types
export interface Family {
  id: string;
  family_name: string;
  head_of_family_id?: string;
  tribe?: string;
  status: string;
  total_members: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  beneficiary_id: string;
  relationship: string;
  priority_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Request Management Types
export interface RequestType {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  category: string;
  requires_documents: boolean;
  required_documents?: string[];
  requires_approval: boolean;
  approval_levels: number;
  sla_hours: number;
  max_amount?: number;
  is_active: boolean;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface BeneficiaryRequest {
  id: string;
  request_number: string;
  beneficiary_id: string;
  request_type_id: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  priority: string;
  assigned_to?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  approved_at?: string;
  approved_by?: string;
  decision_notes?: string;
  rejection_reason?: string;
  sla_due_at: string;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  request_type?: RequestType;
  beneficiary?: Beneficiary;
}

export interface RequestAttachment {
  id: string;
  request_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  description?: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface RequestComment {
  id: string;
  request_id: string;
  user_id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
}
