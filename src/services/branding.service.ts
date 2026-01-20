/**
 * Branding Service - خدمة إدارة الهوية البصرية للوقف
 * @version 1.0.0
 * @description
 * خدمة موحدة لإدارة بيانات الختم والتوقيع والشعار
 * تتبع نمط Component → Hook → Service → Supabase
 */

import { supabase } from "@/integrations/supabase/client";

export interface WaqfBranding {
  id: string;
  stamp_image_url: string | null;
  signature_image_url: string | null;
  nazer_name: string;
  waqf_logo_url: string | null;
  show_logo_in_pdf: boolean;
  show_stamp_in_pdf: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export type WaqfBrandingPublic = Pick<
  WaqfBranding,
  'id' | 'nazer_name' | 'waqf_logo_url' | 'show_logo_in_pdf' | 'show_stamp_in_pdf' | 'created_at' | 'updated_at'
>;

export const BrandingService = {
  /**
   * جلب بيانات الهوية البصرية الكاملة (للموظفين المصرح لهم)
   */
  async getBranding(): Promise<WaqfBranding | null> {
    const { data, error } = await supabase
      .from("waqf_branding")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      // إذا كان خطأ الصلاحيات، نحاول الـ View العامة
      if (error.code === '42501' || error.message.includes('permission')) {
        return this.getPublicBranding();
      }
      throw error;
    }

    return data as WaqfBranding | null;
  },

  /**
   * جلب بيانات الهوية البصرية العامة (بدون التوقيع/الختم)
   */
  async getPublicBranding(): Promise<WaqfBrandingPublic | null> {
    const { data, error } = await supabase
      .from("waqf_branding_public")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as WaqfBrandingPublic | null;
  },

  /**
   * رفع صورة (ختم/توقيع/شعار)
   */
  async uploadImage(file: File, type: "stamp" | "signature" | "logo"): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${type}_${Date.now()}.${fileExt}`;
    const filePath = `waqf-branding/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  },

  /**
   * تحديث بيانات الهوية البصرية
   */
  async updateBranding(brandingId: string, updates: Partial<WaqfBranding>): Promise<void> {
    const { error } = await supabase
      .from("waqf_branding")
      .update(updates)
      .eq("id", brandingId);

    if (error) throw error;
  },
};
