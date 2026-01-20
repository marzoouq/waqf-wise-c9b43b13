/**
 * Tribe Service - خدمة القبائل
 * @description تم تحديثه لاستخدام Soft Delete
 */

import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";
import { SoftDeleteService } from "@/services/shared/soft-delete.service";
import type { Tribe, TribeInsert, TribeUpdate } from "@/types/tribes";

export class TribeService {
  /**
   * جلب جميع القبائل (باستثناء المحذوفة)
   */
  static async getAll(): Promise<Tribe[]> {
    const { data, error } = await supabase
      .from("tribes")
      .select("*")
      .is("deleted_at", null)
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
   * حذف قبيلة (Soft Delete)
   */
  static async delete(id: string, userId?: string): Promise<void> {
    try {
      await SoftDeleteService.softDelete('tribes', id, userId, 'حذف القبيلة');
    } catch (error) {
      productionLogger.error("Error deleting tribe", error);
      throw error;
    }
  }
}
