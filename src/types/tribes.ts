export interface Tribe {
  id: string;
  name: string;
  description: string | null;
  total_families: number | null;
  total_beneficiaries: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
  deletion_reason?: string | null;
}

export interface TribeInsert {
  name: string;
  description?: string | null;
  total_families?: number | null;
  total_beneficiaries?: number | null;
}

export interface TribeUpdate {
  name?: string;
  description?: string | null;
  total_families?: number | null;
  total_beneficiaries?: number | null;
}
