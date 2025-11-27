/**
 * Extended request types with relations
 * Provides type safety for request objects with nested data
 */

import type { BeneficiaryRequest, RequestType } from '@/types';

/**
 * Request with request_type relation loaded
 */
export interface RequestWithType extends Omit<BeneficiaryRequest, 'request_type'> {
  request_type?: Pick<RequestType, 'name_ar' | 'name_en' | 'name' | 'category' | 'icon' | 'color'> | null;
}

/**
 * Request with beneficiary relation loaded
 */
export interface RequestWithBeneficiaryRelation extends BeneficiaryRequest {
  beneficiary?: {
    full_name: string;
    national_id?: string;
    phone?: string;
  } | null;
}

/**
 * Full request with all relations
 */
export interface RequestFull extends Omit<BeneficiaryRequest, 'request_type' | 'beneficiary'> {
  request_type?: Pick<RequestType, 'name_ar' | 'name_en' | 'name' | 'category' | 'icon' | 'color'> | null;
  beneficiary?: {
    full_name: string;
    national_id?: string;
    phone?: string;
  } | null;
}

/**
 * Request for approval dialog
 */
export interface RequestForApprovalDialog {
  id: string;
  request_number: string | null;
  beneficiary_id: string;
  description: string;
  amount: number | null;
  status: string | null;
  priority: string | null;
  request_type?: {
    name_ar?: string;
    name_en?: string;
  } | null;
  beneficiary?: {
    full_name: string;
  } | null;
}
