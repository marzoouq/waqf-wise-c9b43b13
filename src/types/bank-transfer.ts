/**
 * أنواع التحويلات البنكية
 */

export type BankFileFormat = 
  | "ISO20022" 
  | "SWIFT_MT940" 
  | "CSV" 
  | "EXCEL" 
  | "SEPA" 
  | "ACH" 
  | "BACS" 
  | "NCB" 
  | "ALRAJHI";

export interface BankTransferBeneficiary {
  full_name: string | null;
  iban: string | null;
  bank_name: string | null;
}

export interface DistributionDetail {
  id: string;
  distribution_id: string;
  beneficiary_id: string;
  allocated_amount: number;
  payment_status: string;
  notes?: string | null;
  beneficiaries: BankTransferBeneficiary | null;
}

export interface GeneratedTransferFile {
  fileNumber: string;
  totalAmount: number;
  totalTransactions: number;
  fileContent: string;
}
