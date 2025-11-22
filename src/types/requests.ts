export interface BeneficiaryRequestInsert {
  beneficiary_id: string;
  request_type_id: string;
  description: string;
  amount?: number;
  priority?: string;
  status?: string;
}
