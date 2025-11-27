/**
 * أنواع قوالب القيود التلقائية
 */

import type { Json } from "@/integrations/supabase/types";

export interface AccountMapping {
  account_code: string;
  percentage: number;
}

export interface AutoJournalTemplateRaw {
  id: string;
  template_name: string;
  trigger_event: string;
  debit_accounts: Json;
  credit_accounts: Json;
  description: string | null;
  is_active: boolean | null;
  priority: number | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
}

export interface AutoJournalTemplate {
  id: string;
  template_name: string;
  trigger_event: string;
  debit_accounts: AccountMapping[];
  credit_accounts: AccountMapping[];
  description: string | null;
  is_active: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
}

export interface AutoJournalTemplateInsert {
  template_name: string;
  trigger_event: string;
  debit_accounts: AccountMapping[];
  credit_accounts: AccountMapping[];
  description?: string;
  is_active?: boolean;
  priority?: number;
}

export interface AutoJournalTemplateUpdate {
  id: string;
  template_name?: string;
  trigger_event?: string;
  debit_accounts?: AccountMapping[];
  credit_accounts?: AccountMapping[];
  description?: string;
  is_active?: boolean;
  priority?: number;
}

/**
 * تحويل البيانات الخام من Supabase إلى النوع المطلوب
 */
export function parseAutoJournalTemplate(raw: AutoJournalTemplateRaw): AutoJournalTemplate {
  return {
    ...raw,
    debit_accounts: Array.isArray(raw.debit_accounts) 
      ? (raw.debit_accounts as unknown as AccountMapping[]) 
      : [],
    credit_accounts: Array.isArray(raw.credit_accounts) 
      ? (raw.credit_accounts as unknown as AccountMapping[]) 
      : [],
    is_active: raw.is_active ?? false,
    priority: raw.priority ?? 100,
  };
}
