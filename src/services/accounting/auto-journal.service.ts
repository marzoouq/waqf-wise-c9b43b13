/**
 * Auto Journal Service - خدمة القيود التلقائية
 * إدارة قوالب القيود التلقائية وتنفيذها
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database, Json } from '@/integrations/supabase/types';

export interface AccountMapping {
  account_code: string;
  percentage?: number;
  fixed_amount?: number;
}

export interface AutoJournalTemplate {
  id: string;
  trigger_event: string;
  template_name: string;
  description?: string;
  debit_accounts: AccountMapping[];
  credit_accounts: AccountMapping[];
  is_active: boolean;
  priority: number;
  created_at: string;
}

export interface AutoJournalTemplateInsert {
  trigger_event: string;
  template_name: string;
  description?: string;
  debit_accounts: AccountMapping[];
  credit_accounts: AccountMapping[];
  is_active?: boolean;
  priority?: number;
}

function parseAccountMappings(data: Json): AccountMapping[] {
  if (!data || !Array.isArray(data)) return [];
  return data as unknown as AccountMapping[];
}

export class AutoJournalService {
  /**
   * جلب قوالب القيود التلقائية
   */
  static async getTemplates(): Promise<AutoJournalTemplate[]> {
    const { data, error } = await supabase
      .from('auto_journal_templates')
      .select('id, trigger_event, template_name, description, debit_accounts, credit_accounts, is_active, priority, created_at, created_by, updated_at')
      .order('priority', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      debit_accounts: parseAccountMappings(item.debit_accounts),
      credit_accounts: parseAccountMappings(item.credit_accounts),
      is_active: item.is_active ?? false,
      priority: item.priority ?? 0,
    })) as AutoJournalTemplate[];
  }

  /**
   * جلب القوالب النشطة
   */
  static async getActiveTemplates(): Promise<Database['public']['Tables']['auto_journal_templates']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('auto_journal_templates')
        .select('*')
        .eq('is_active', true)
        .order('priority');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching auto journal templates', error);
      throw error;
    }
  }

  /**
   * إنشاء قالب قيد تلقائي
   */
  static async createTemplate(template: AutoJournalTemplateInsert) {
    const { data, error } = await supabase
      .from('auto_journal_templates')
      .insert({
        trigger_event: template.trigger_event,
        template_name: template.template_name,
        description: template.description,
        debit_accounts: template.debit_accounts as unknown as Json,
        credit_accounts: template.credit_accounts as unknown as Json,
        is_active: template.is_active,
        priority: template.priority,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل إنشاء القالب');
    return data;
  }

  /**
   * تحديث قالب قيد تلقائي
   */
  static async updateTemplate(id: string, template: Partial<AutoJournalTemplate>) {
    const updateData: Record<string, unknown> = { ...template };
    if (template.debit_accounts) {
      updateData.debit_accounts = template.debit_accounts as unknown as Json;
    }
    if (template.credit_accounts) {
      updateData.credit_accounts = template.credit_accounts as unknown as Json;
    }
    
    const { data, error } = await supabase
      .from('auto_journal_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('القالب غير موجود');
    return data;
  }

  /**
   * حذف قالب قيد تلقائي
   */
  static async deleteTemplate(id: string) {
    const { error } = await supabase
      .from('auto_journal_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * تفعيل/تعطيل قالب
   */
  static async toggleActive(id: string, is_active: boolean) {
    const { error } = await supabase
      .from('auto_journal_templates')
      .update({ is_active })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * إنشاء قيد تلقائي - يدعم account_code و account_id
   */
  static async createAutoJournalEntry(params: {
    trigger: string;
    referenceId: string;
    referenceType: string;
    amount: number;
    description: string;
  }) {
    try {
      const { data: templates } = await supabase
        .from('auto_journal_templates')
        .select('*')
        .eq('trigger_event', params.trigger)
        .eq('is_active', true)
        .order('priority')
        .limit(1);

      if (!templates || templates.length === 0) return null;

      const template = templates[0];
      
      // جلب قائمة الحسابات للبحث بالكود
      const { data: accountsList } = await supabase
        .from('accounts')
        .select('id, code')
        .eq('is_active', true);
      
      const accountCodeToId = new Map(accountsList?.map(a => [a.code, a.id]) || []);
      
      // دالة للحصول على account_id من الكود أو المعرف
      const resolveAccountId = (acc: { account_code?: string; account_id?: string }) => {
        if (acc.account_code) {
          return accountCodeToId.get(acc.account_code) || acc.account_id;
        }
        return acc.account_id;
      };

      const debitAccounts = template.debit_accounts as { account_code?: string; account_id?: string; percentage: number }[];
      const creditAccounts = template.credit_accounts as { account_code?: string; account_id?: string; percentage: number }[];

      const lines = [
        ...debitAccounts.map(acc => ({
          account_id: resolveAccountId(acc),
          debit_amount: (params.amount * (acc.percentage || 100)) / 100,
          credit_amount: 0,
        })),
        ...creditAccounts.map(acc => ({
          account_id: resolveAccountId(acc),
          debit_amount: 0,
          credit_amount: (params.amount * (acc.percentage || 100)) / 100,
        })),
      ].filter(line => line.account_id); // استبعاد السطور بدون حساب

      if (lines.length === 0) {
        productionLogger.error('No valid accounts found for auto journal entry', { template: template.id });
        return null;
      }

      const { data: activeFY } = await supabase
        .from('fiscal_years')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();

      // إنشاء القيد
      const { data: journalEntry, error: entryError } = await supabase
        .from('journal_entries')
        .insert([{
          description: params.description,
          entry_date: new Date().toISOString().split('T')[0],
          entry_number: `AUTO-${Date.now()}`,
          status: 'draft',
          reference_type: params.referenceType,
          reference_id: params.referenceId,
          fiscal_year_id: activeFY?.id || '',
        }])
        .select()
        .single();

      if (entryError) throw entryError;

      // إنشاء سطور القيد
      const entryLines = lines.map((line, index) => ({
        ...line,
        journal_entry_id: journalEntry.id,
        line_number: index + 1,
      }));

      await supabase
        .from('journal_entry_lines')
        .insert(entryLines);

      // تسجيل في سجل القيود التلقائية
      await supabase.from('auto_journal_log').insert([{
        template_id: template.id,
        trigger_event: params.trigger,
        reference_id: params.referenceId,
        reference_type: params.referenceType,
        amount: params.amount,
        journal_entry_id: journalEntry.id,
        success: true,
      }]);

      return journalEntry;
    } catch (error) {
      productionLogger.error('Error creating auto journal entry', error);
      
      // تسجيل الخطأ في السجل
      await supabase.from('auto_journal_log').insert([{
        trigger_event: params.trigger,
        reference_id: params.referenceId,
        reference_type: params.referenceType,
        amount: params.amount,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      }]);
      
      throw error;
    }
  }
}
