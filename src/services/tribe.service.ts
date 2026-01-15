/**
 * Tribe Service - خدمة القبائل
 */

import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";
import type { Tribe, TribeInsert, TribeUpdate } from "@/types/tribes";

export class TribeService {
  /**
   * جلب جميع القبائل
   */
  static async getAll(): Promise<Tribe[]> {
    const { data, error } = await supabase
      .from("tribes")
      .select("*")
      .order("name");

    if (error) {
      productionLogger.error("Error fetching tribes", error);
      throw error;
    }
    return data as Tribe[];
  }

  /**
   * إضافة قبيلة جديدة
   */
  static async create(tribe: TribeInsert): Promise<Tribe> {
    const { data, error } = await supabase
      .from("tribes")
      .insert([tribe])
      .select()
      .maybeSingle();

    if (error) {
      productionLogger.error("Error creating tribe", error);
      throw error;
    }
    if (!data) throw new Error("فشل في إنشاء القبيلة");
    return data;
  }

  /**
   * تحديث قبيلة
   */
  static async update(id: string, updates: TribeUpdate): Promise<Tribe> {
    const { data, error } = await supabase
      .from("tribes")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      productionLogger.error("Error updating tribe", error);
      throw error;
    }
    if (!data) throw new Error("القبيلة غير موجودة");
    return data;
  }

  /**
   * حذف قبيلة
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("tribes")
      .delete()
      .eq("id", id);

    if (error) {
      productionLogger.error("Error deleting tribe", error);
      throw error;
    }
  }
}
