export interface MaintenanceRequestInsert {
  request_number?: string;
  property_id: string;
  contract_id?: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  status?: string;
  requested_by: string;
  requested_date: string;
  scheduled_date?: string;
  estimated_cost?: number;
  assigned_to?: string;
  vendor_name?: string;
  notes?: string;
}

export interface MaintenanceRequestUpdate {
  title?: string;
  description?: string;
  priority?: string;
  category?: string;
  status?: string;
  scheduled_date?: string;
  completed_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  assigned_to?: string;
  vendor_name?: string;
  notes?: string;
}
