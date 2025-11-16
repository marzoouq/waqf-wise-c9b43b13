export interface Tribe {
  id: string;
  name: string;
  description?: string;
  total_families: number;
  total_beneficiaries: number;
  created_at: string;
}

export interface TribeInsert {
  name: string;
  description?: string;
  total_families?: number;
  total_beneficiaries?: number;
}

export interface TribeUpdate {
  name?: string;
  description?: string;
  total_families?: number;
  total_beneficiaries?: number;
}
