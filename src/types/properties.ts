// أنواع العقارات والعقود

export interface Property {
  id: string;
  property_number: string;
  property_name: string;
  property_type: string;
  location: string;
  area: number | null;
  status: string;
  estimated_value: number | null;
  annual_revenue: number | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  contract_number: string;
  property_id: string;
  contract_type: string;
  tenant_name: string;
  tenant_id_number: string;
  tenant_phone: string;
  tenant_email: string | null;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  payment_frequency: string;
  status: string;
  auto_renew: boolean;
  is_renewable: boolean;
  renewal_notice_days: number;
  terms_and_conditions: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractRenewal {
  id: string;
  original_contract_id: string;
  new_contract_id: string | null;
  renewal_date: string;
  new_start_date: string;
  new_end_date: string;
  new_monthly_rent: number;
  rent_increase_percentage: number | null;
  rent_increase_amount: number | null;
  status: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface RentalPayment {
  id: string;
  contract_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  status: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  request_number: string;
  request_type: string;
  priority: string;
  description: string;
  reported_by: string;
  reported_date: string;
  assigned_to: string | null;
  status: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  scheduled_date: string | null;
  completed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractAttachment {
  id: string;
  contract_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  description: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
}
