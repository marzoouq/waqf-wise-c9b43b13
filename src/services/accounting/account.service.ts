/**
 * Account Service - خدمة الحسابات
 * إدارة شجرة الحسابات والعمليات المتعلقة بها
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

type AccountRow = Database['public']['Tables']['accounts']['Row'];

export class AccountService {
  /**
   * جلب جميع الحسابات
   */
  static async getAccounts() {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('code', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching accounts', error);
      throw error;
    }
  }

  /**
   * جلب حساب بالرمز
   */
  static async getAccountByCode(code: string) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id')
        .eq('code', code)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching account by code', error);
      throw error;
    }
  }

  /**
   * إنشاء حساب جديد
   */
  static async createAccount(account: {
    code: string;
    name_ar: string;
    name_en?: string | null;
    parent_id?: string | null;
    account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    account_nature: 'debit' | 'credit';
    description?: string | null;
    is_active?: boolean;
    is_header?: boolean;
  }) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{ ...account, is_active: account.is_active ?? true }])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل إنشاء الحساب');
      return data;
    } catch (error) {
      productionLogger.error('Error creating account', error);
      throw error;
    }
  }

  /**
   * تحديث حساب
   */
  static async updateAccount(id: string, updates: {
    code?: string;
    name_ar?: string;
    name_en?: string | null;
    parent_id?: string | null;
    account_type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    account_nature?: 'debit' | 'credit';
    description?: string | null;
    is_active?: boolean;
    is_header?: boolean;
  }) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error updating account', error);
      throw error;
    }
  }

  /**
   * حذف حساب
   */
  static async deleteAccount(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting account', error);
      throw error;
    }
  }

  /**
   * جلب الحسابات النشطة غير الرئيسية
   */
  static async getActiveLeafAccounts() {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('is_active', true)
        .eq('is_header', false)
        .order('code');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching active leaf accounts', error);
      throw error;
    }
  }

  /**
   * جلب شجرة الحسابات
   */
  static async getChartOfAccounts(): Promise<AccountRow[]> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('is_active', true)
        .order('code');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching chart of accounts', error);
      throw error;
    }
  }

  /**
   * جلب حساب واحد
   */
  static async getAccountById(id: string): Promise<AccountRow | null> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching account', error);
      throw error;
    }
  }

  /**
   * جلب حساب مع رصيده
   */
  static async getAccountWithBalance(id: string): Promise<AccountRow & { balance: number }> {
    try {
      const account = await this.getAccountById(id);
      if (!account) throw new Error('الحساب غير موجود');

      return { ...account, balance: account.current_balance || 0 };
    } catch (error) {
      productionLogger.error('Error fetching account with balance', error);
      throw error;
    }
  }

  /**
   * جلب توزيع الحسابات حسب النوع
   */
  static async getAccountDistribution(): Promise<{ name: string; value: number; count: number }[]> {
    try {
      const { data: accounts, error } = await supabase
        .from("accounts")
        .select("account_type")
        .eq("is_active", true);

      if (error) throw error;

      const distribution = new Map<string, number>();
      accounts?.forEach((account) => {
        const type = account.account_type;
        distribution.set(type, (distribution.get(type) || 0) + 1);
      });

      const typeLabels: Record<string, string> = {
        asset: 'الأصول',
        liability: 'الخصوم',
        equity: 'حقوق الملكية',
        revenue: 'الإيرادات',
        expense: 'المصروفات',
      };

      return Array.from(distribution.entries()).map(([type, count]) => ({
        name: typeLabels[type] || type,
        value: count,
        count: count,
      }));
    } catch (error) {
      productionLogger.error('Error fetching account distribution', error);
      throw error;
    }
  }

  /**
   * جلب الحسابات للقيد
   */
  static async getAccountsForEntry() {
    const { data, error } = await supabase
      .from('accounts')
      .select('id, code, name_ar, account_type, account_nature')
      .eq('is_header', false)
      .eq('is_active', true)
      .order('code');

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب الحسابات للدفتر
   */
  static async getAccountsForLedger() {
    const { data, error } = await supabase
      .from("accounts")
      .select("id, code, name_ar")
      .eq("is_active", true)
      .eq("is_header", false)
      .order("code");

    if (error) throw error;
    return data || [];
  }
}
