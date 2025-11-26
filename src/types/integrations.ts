export interface BankIntegration {
  id: string;
  bank_name: string;
  bank_code: string;
  api_endpoint?: string;
  api_version?: string;
  auth_method: string;
  is_active: boolean;
  supports_transfers: boolean;
  supports_balance_inquiry: boolean;
  supports_statement: boolean;
  configuration: Record<string, any>;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentGateway {
  id: string;
  gateway_name: string;
  gateway_type: string;
  is_active: boolean;
  merchant_id?: string;
  configuration: Record<string, any>;
  supported_methods: string[];
  success_rate?: number;
  total_transactions: number;
  created_at: string;
  updated_at: string;
}

export interface GatewayTransaction {
  id: string;
  gateway_id: string;
  payment_voucher_id?: string;
  beneficiary_id?: string;
  transaction_reference: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  gateway_response?: Record<string, any>;
  processed_at?: string;
  created_at: string;
}

export interface GovernmentIntegration {
  id: string;
  service_name: string;
  service_type: string;
  api_endpoint?: string;
  is_active: boolean;
  requires_authentication: boolean;
  last_sync_at?: string;
  sync_frequency: string;
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}
