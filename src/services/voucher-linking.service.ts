/**
 * Voucher Linking Service - خدمة ربط السندات بالقيود المحاسبية
 * @version 1.0.0
 * @description
 * خدمة موحدة لربط سندات القبض والصرف بالقيود المحاسبية
 * تتبع نمط Component → Hook → Service → Supabase
 */

import { supabase } from "@/integrations/supabase/client";

export interface LinkVoucherResult {
  success: boolean;
  journalEntryId?: string;
  message?: string;
}

export const VoucherLinkingService = {
  /**
   * ربط سند بقيد محاسبي
   */
  async linkVoucherToJournal(voucherId: string, createJournal: boolean = true): Promise<LinkVoucherResult> {
    const { data, error } = await supabase.functions.invoke('link-voucher-journal', {
      body: { voucher_id: voucherId, create_journal: createJournal }
    });

    if (error) {
      throw new Error(error.message || 'فشل ربط السند بالقيد المحاسبي');
    }

    return {
      success: true,
      journalEntryId: data?.journal_entry_id,
      message: 'تم ربط السند بنجاح',
    };
  },

  /**
   * فك ربط سند من قيد محاسبي
   */
  async unlinkVoucher(voucherId: string): Promise<void> {
    const { error } = await supabase
      .from('payment_vouchers')
      .update({ journal_entry_id: null })
      .eq('id', voucherId);

    if (error) throw error;
  },

  /**
   * جلب السندات غير المرتبطة
   */
  async getUnlinkedVouchers(): Promise<number> {
    const { count, error } = await supabase
      .from('payment_vouchers')
      .select('*', { count: 'exact', head: true })
      .is('journal_entry_id', null)
      .eq('voucher_type', 'payment');

    if (error) throw error;
    return count || 0;
  },
};
