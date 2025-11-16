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
  is_renewable: boolean;
  auto_renew: boolean;
  renewal_notice_days: number;
  terms_and_conditions?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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
  is_renewable?: boolean;
  auto_renew?: boolean;
  renewal_notice_days?: number;
  terms_and_conditions?: string;
  notes?: string;
}
