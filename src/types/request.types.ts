/**
 * أنواع الطلبات المحسنة
 * Enhanced Request Types
 */

import type { BeneficiaryRequest, RequestType } from './index';

// Re-export RequestType for convenience
export type { RequestType };

/**
 * الطلب مع نوع الطلب المضمن
 */
export interface RequestWithType extends Omit<BeneficiaryRequest, 'request_type'> {
  request_type?: RequestType | null;
}

/**
 * المستفيد المضمن في الطلب
 */
export interface RequestBeneficiary {
  id: string;
  full_name: string;
  national_id?: string;
  phone?: string;
}

/**
 * الطلب الكامل مع جميع العلاقات
 */
export interface FullRequest extends Omit<BeneficiaryRequest, 'beneficiary' | 'request_type'> {
  beneficiary?: RequestBeneficiary | null;
  request_type?: RequestType | null;
}

/**
 * Helper function to safely get request type name
 */
export function getRequestTypeName(request: { request_type?: RequestType | { name_ar?: string } | null }): string {
  if (!request.request_type) return '-';
  return request.request_type.name_ar || '-';
}

/**
 * Helper function to safely get beneficiary name from request
 */
export function getBeneficiaryName(request: { beneficiary?: { full_name?: string } | null }): string {
  if (!request.beneficiary) return '-';
  return request.beneficiary.full_name || '-';
}
