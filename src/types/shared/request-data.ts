/**
 * Shared request data type for use across request pages
 * This type represents the actual shape of data returned from useRequests hook
 */

export interface RequestData {
  id: string;
  request_number: string;
  beneficiary_id: string;
  description: string;
  amount: number;
  status: string;
  priority: string;
  is_overdue: boolean;
  submitted_at: string;
  request_type_id?: string;
  assigned_to?: string;
  sla_due_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  rejection_reason?: string;
  decision_notes?: string;
  created_at?: string;
  updated_at?: string;
  // Relations (partial from Supabase select)
  request_type?: {
    name_ar?: string;
    name?: string;
    description?: string;
  } | null;
  beneficiary?: {
    full_name?: string;
  } | null;
  // Allow additional properties
  [key: string]: unknown;
}

/**
 * Get request type name safely
 */
export function getRequestTypeName(request: { request_type?: { name_ar?: string } | null }): string {
  return request.request_type?.name_ar || '-';
}

/**
 * Get beneficiary name safely
 */
export function getBeneficiaryName(request: { beneficiary?: { full_name?: string } | null }): string {
  return request.beneficiary?.full_name || '-';
}
