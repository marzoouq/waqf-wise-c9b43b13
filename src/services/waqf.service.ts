/**
 * Waqf Service - خدمة إدارة أقلام الوقف
 * @version 2.8.47
 */

import { supabase } from "@/integrations/supabase/client";

export interface WaqfProperty {
  id: string;
  name: string;
  type: string;
  location: string;
  units: number;
  occupied: number;
  monthly_revenue: number;
  status: string;
  contracts?: {
    monthly_rent: number;
    payment_frequency: string;
    status: string;
  }[];
}

export interface UnlinkedProperty {
  id: string;
  name: string;
  location: string;
  type: string;
  waqf_unit_id: string | null;
}

export const WaqfService = {
  /**
   * جلب العقارات غير المرتبطة بأقلام وقف
   */
  async getUnlinkedProperties(): Promise<UnlinkedProperty[]> {
    const { data, error } = await supabase
      .from("properties")
      .select("id, name, location, type, waqf_unit_id")
      .is("waqf_unit_id", null);

    if (error) throw error;
    return data || [];
  },

  /**
   * ربط عقار بقلم وقف
   */
  async linkProperty(propertyId: string, waqfUnitId: string): Promise<void> {
    const { error } = await supabase
      .from("properties")
      .update({ waqf_unit_id: waqfUnitId })
      .eq("id", propertyId);

    if (error) throw error;
  },

  /**
   * جلب عقارات قلم وقف
   */
  async getWaqfUnitProperties(waqfUnitId: string): Promise<WaqfProperty[]> {
    const { data, error } = await supabase
      .from("properties")
      .select(`
        id, name, type, location, units, occupied, monthly_revenue, status,
        contracts!contracts_property_id_fkey(
          monthly_rent, 
          payment_frequency, 
          status
        )
      `)
      .eq("waqf_unit_id", waqfUnitId);

    if (error) throw error;
    return (data || []) as WaqfProperty[];
  },

  /**
   * إلغاء ربط عقار من قلم وقف
   */
  async unlinkProperty(propertyId: string): Promise<void> {
    const { error } = await supabase
      .from("properties")
      .update({ waqf_unit_id: null })
      .eq("id", propertyId);

    if (error) throw error;
  },
};
