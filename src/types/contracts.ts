export interface Contract {
  id: string;
  contract_number: string;
  property_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_id_number: string;
  tenant_email?: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  payment_frequency: string;
  status: string;
  units_count?: number;
  is_renewable: boolean;
  auto_renew: boolean;
  renewal_notice_days: number;
  terms_and_conditions?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  ejar_document_url?: string;
  ejar_document_name?: string;
  properties?: {
    name: string;
    type: string;
    location: string;
  };
}

export interface ContractInsert {
  contract_number: string;
  property_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_id_number: string;
  tenant_email?: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit?: number;
  payment_frequency: string;
  status?: string;
  units_count?: number;
  is_renewable?: boolean;
  auto_renew?: boolean;
  renewal_notice_days?: number;
  terms_and_conditions?: string;
  notes?: string;
  ejar_document_url?: string;
  ejar_document_name?: string;
}

export interface ContractWithUnitsCount extends Contract {
  units_count?: number;
}

export interface ContractStatus {
  status: string;
  monthly_rent: number;
  end_date?: string;
}
