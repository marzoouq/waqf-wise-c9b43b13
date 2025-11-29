/**
 * Types for Documents & Archive Module
 * أنواع وحدة المستندات والأرشيف
 */

export interface Document {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  file_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  folder_id?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface DocumentUploadData {
  name: string;
  category: string;
  description?: string;
  folder_id?: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_id?: string | null;
  description?: string | null;
  created_at: string;
}

export type DocumentCategory = 
  | 'contracts'
  | 'legal'
  | 'reports'
  | 'governance'
  | 'beneficiary'
  | 'receipts'
  | 'other';
