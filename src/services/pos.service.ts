/**
 * POS Service - خدمة نقاط البيع
 * @version 2.8.22
 */

import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface POSDailyStats {
  total_collections: number;
  total_payments: number;
  net_amount: number;
  transactions_count: number;
  cash_amount: number;
  card_amount: number;
  transfer_amount: number;
}

export class POSService {
  /**
   * جلب إحصائيات اليوم
   */
  static async getDailyStats(date: Date = new Date()): Promise<POSDailyStats> {
    const formattedDate = format(date, "yyyy-MM-dd");
    const { data, error } = await supabase.rpc("get_pos_daily_stats", {
      p_date: formattedDate,
    });

    if (error) throw error;
    return (data?.[0] as POSDailyStats) || {
      total_collections: 0,
      total_payments: 0,
      net_amount: 0,
      transactions_count: 0,
      cash_amount: 0,
      card_amount: 0,
      transfer_amount: 0,
    };
  }

  /**
   * جلب إحصائيات الوردية
   */
  static async getShiftStats(shiftId: string): Promise<any> {
    const { data, error } = await supabase.rpc("get_shift_stats", {
      p_shift_id: shiftId,
    });

    if (error) throw error;
    return data?.[0] || null;
  }

  /**
   * جلب التسوية اليومية
   */
  static async getDailySettlement(date: Date = new Date()): Promise<any> {
    const formattedDate = format(date, "yyyy-MM-dd");
    // استخدام get_pos_daily_stats كبديل
    const { data, error } = await supabase.rpc("get_pos_daily_stats", {
      p_date: formattedDate,
    });

    if (error) throw error;
    return data?.[0] || null;
  }
}
