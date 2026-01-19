/**
 * Journal Entry Service - خدمة القيود المحاسبية
 * إدارة القيود اليومية والموافقات
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import { withRetry, SUPABASE_RETRY_OPTIONS } from '@/lib/retry-helper';
import type { Database } from '@/integrations/supabase/types';

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];
type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert'];
type JournalEntryLineRow = Database['public']['Tables']['journal_entry_lines']['Row'];

export class JournalEntryService {
  /**
   * توليد رقم قيد جديد
   */
  static async generateNextEntryNumber(): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const { data: lastEntry } = await supabase
        .from('journal_entries')
        .select('entry_number')
        .like('entry_number', `JV-${year}-%`)
        .order('entry_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      let nextNumber = 1;
      if (lastEntry && lastEntry.entry_number) {
        const match = lastEntry.entry_number.match(/JV-\d+-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      return `JV-${year}-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      productionLogger.error('Error generating entry number', error);
      throw error;
    }
  }

  /**
   * جلب القيود مع سطورها (مع آلية إعادة المحاولة)
   */
  static async getJournalEntriesWithLines() {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('journal_entries')
          .select(`
            *,
            journal_entry_lines (
              *,
              accounts (code, name_ar, account_type)
            )
          `)
          .order('entry_date', { ascending: false });

        if (error) throw error;
        return data || [];
      }, SUPABASE_RETRY_OPTIONS);
    } catch (error) {
      productionLogger.error('Error fetching journal entries with lines', error);
      throw error;
    }
  }

  /**
   * جلب القيود المحاسبية (مع آلية إعادة المحاولة)
   */
  static async getJournalEntries(filters?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<JournalEntryRow[]> {
    try {
      return await withRetry(async () => {
        let query = supabase
          .from('journal_entries')
          .select('*');

        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status as JournalEntryRow['status']);
        }
        if (filters?.fromDate) {
          query = query.gte('entry_date', filters.fromDate);
        }
        if (filters?.toDate) {
          query = query.lte('entry_date', filters.toDate);
        }

        const { data, error } = await query.order('entry_date', { ascending: false });

        if (error) throw error;
        return data || [];
      }, SUPABASE_RETRY_OPTIONS);
    } catch (error) {
      productionLogger.error('Error fetching journal entries', error);
      throw error;
    }
  }

  /**
   * جلب قيد محاسبي واحد (مع آلية إعادة المحاولة)
   */
  static async getJournalEntryById(id: string): Promise<JournalEntryRow | null> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        return data;
      }, SUPABASE_RETRY_OPTIONS);
    } catch (error) {
      productionLogger.error('Error fetching journal entry', error);
      throw error;
    }
  }

  /**
   * إنشاء قيد محاسبي جديد
   */
  static async createJournalEntry(
    entry: Omit<JournalEntryInsert, 'id' | 'created_at' | 'updated_at'>,
    lines: Array<{ account_id: string; debit_amount: number; credit_amount: number; description?: string }>
  ): Promise<JournalEntryRow> {
    try {
      // التحقق من توازن القيد
      const totalDebit = lines.reduce((sum, l) => sum + (l.debit_amount || 0), 0);
      const totalCredit = lines.reduce((sum, l) => sum + (l.credit_amount || 0), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('القيد غير متوازن: مجموع المدين لا يساوي مجموع الدائن');
      }

      // إنشاء القيد
      const { data: journalEntry, error: entryError } = await supabase
        .from('journal_entries')
        .insert([entry])
        .select()
        .maybeSingle();

      if (entryError) throw entryError;
      if (!journalEntry) throw new Error('فشل إنشاء القيد');

      // إنشاء سطور القيد
      const entryLines = lines.map((line, index) => ({
        ...line,
        journal_entry_id: journalEntry.id,
        line_number: index + 1,
      }));

      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(entryLines);

      if (linesError) throw linesError;

      return journalEntry;
    } catch (error) {
      productionLogger.error('Error creating journal entry', error);
      throw error;
    }
  }

  /**
   * ترحيل قيد محاسبي
   */
  static async postJournalEntry(id: string, postedBy: string): Promise<JournalEntryRow | null> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({
          status: 'posted',
          posted_by: postedBy,
          posted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // تحديث أرصدة الحسابات
      await this.updateAccountBalances(id);

      return data;
    } catch (error) {
      productionLogger.error('Error posting journal entry', error);
      throw error;
    }
  }

  /**
   * إلغاء قيد محاسبي
   */
  static async cancelJournalEntry(id: string): Promise<JournalEntryRow | null> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error cancelling journal entry', error);
      throw error;
    }
  }

  /**
   * تحديث أرصدة الحسابات
   */
  static async updateAccountBalances(journalEntryId: string): Promise<void> {
    try {
      const { data: lines, error } = await supabase
        .from('journal_entry_lines')
        .select('account_id, debit_amount, credit_amount')
        .eq('journal_entry_id', journalEntryId);

      if (error) throw error;

      for (const line of lines || []) {
        const { data: account } = await supabase
          .from('accounts')
          .select('current_balance, account_nature')
          .eq('id', line.account_id)
          .maybeSingle();

        if (account) {
          let newBalance = account.current_balance || 0;
          if (account.account_nature === 'debit') {
            newBalance += (line.debit_amount || 0) - (line.credit_amount || 0);
          } else {
            newBalance += (line.credit_amount || 0) - (line.debit_amount || 0);
          }

          await supabase
            .from('accounts')
            .update({ current_balance: newBalance })
            .eq('id', line.account_id);
        }
      }
    } catch (error) {
      productionLogger.error('Error updating account balances', error);
      throw error;
    }
  }

  /**
   * الموافقة على قيد محاسبي
   */
  static async approveJournalEntry(id: string, action: 'approve' | 'reject', notes?: string): Promise<JournalEntryRow | null> {
    try {
      const status = action === 'approve' ? 'posted' : 'cancelled';
      const { data, error } = await supabase
        .from('journal_entries')
        .update({
          status,
          posted_at: action === 'approve' ? new Date().toISOString() : undefined,
          notes: notes || undefined,
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      if (action === 'approve') {
        await this.updateAccountBalances(id);
      }

      return data;
    } catch (error) {
      productionLogger.error('Error approving journal entry', error);
      throw error;
    }
  }

  /**
   * جلب سطور القيد
   */
  static async getJournalEntryLines(journalEntryId: string): Promise<JournalEntryLineRow[]> {
    try {
      const { data, error } = await supabase
        .from('journal_entry_lines')
        .select('*')
        .eq('journal_entry_id', journalEntryId)
        .order('line_number');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching journal entry lines', error);
      throw error;
    }
  }

  /**
   * جلب آخر القيود المحاسبية
   */
  static async getRecentJournalEntries(limit: number = 5): Promise<JournalEntryRow[]> {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, entry_number, description, status, entry_date")
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data || []) as JournalEntryRow[];
    } catch (error) {
      productionLogger.error('Error fetching recent journal entries', error);
      throw error;
    }
  }

  /**
   * جلب سطور القيد مع الحساب
   */
  static async getJournalEntryLinesWithAccount(entryId: string) {
    const { data, error } = await supabase
      .from("journal_entry_lines")
      .select(`
        *,
        account:accounts(code, name_ar)
      `)
      .eq("journal_entry_id", entryId)
      .order("line_number");

    if (error) throw error;
    return data || [];
  }

  /**
   * ترحيل القيد
   */
  static async postJournalEntryById(entryId: string) {
    const { error } = await supabase
      .from("journal_entries")
      .update({ status: "posted", posted_at: new Date().toISOString() })
      .eq("id", entryId);

    if (error) throw error;
  }

  /**
   * تحديث حالة القيد
   */
  static async updateJournalEntryStatus(entryId: string, status: 'draft' | 'posted' | 'cancelled') {
    const { error } = await supabase
      .from('journal_entries')
      .update({
        status,
        posted_at: status === 'posted' ? new Date().toISOString() : undefined,
      })
      .eq('id', entryId);

    if (error) throw error;
  }

  /**
   * جلب سطور القيود حسب الحساب
   */
  static async getJournalEntryLinesByAccount(accountId: string, options?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    id: string;
    debit_amount: number;
    credit_amount: number;
    description?: string;
    journal_entries: {
      entry_number: string;
      entry_date: string;
      description: string;
      status: string;
    };
  }[]> {
    let query = supabase
      .from('journal_entry_lines')
      .select(`
        *,
        journal_entries(
          entry_number,
          entry_date,
          description,
          status
        )
      `)
      .eq('account_id', accountId)
      .order('created_at', { ascending: true });

    if (options?.startDate) {
      query = query.gte('journal_entries.entry_date', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('journal_entries.entry_date', options.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}
