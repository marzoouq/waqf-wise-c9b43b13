/**
 * Disclosure Service - خدمة الإفصاحات السنوية
 * @version 2.8.65
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";

type DisclosureRow = Database['public']['Tables']['annual_disclosures']['Row'];
type DisclosureDocument = Database['public']['Tables']['disclosure_documents']['Row'];

export interface SmartDisclosureDocument {
  id: string;
  disclosure_id: string;
  document_name: string;
  document_type: string;
  file_path: string;
  file_size: number | null;
  description: string | null;
  fiscal_year: number;
  uploaded_by: string | null;
  created_at: string;
  extracted_content: Json | null;
  content_summary: string | null;
  total_amount: number | null;
  items_count: number | null;
}

export class DisclosureService {
  /**
   * جلب آخر إفصاح سنوي
   */
  static async getLatest(): Promise<DisclosureRow | null> {
    const { data, error } = await supabase
      .from("annual_disclosures")
      .select("*")
      .order("year", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  /**
   * جلب جميع الإفصاحات
   */
  static async getAll(): Promise<DisclosureRow[]> {
    const { data, error } = await supabase
      .from("annual_disclosures")
      .select("*")
      .order("year", { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب إفصاح بواسطة المعرف
   */
  static async getById(id: string): Promise<DisclosureRow | null> {
    const { data, error } = await supabase
      .from("annual_disclosures")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  /**
   * جلب مستندات الإفصاح
   */
  static async getDocuments(disclosureId: string): Promise<DisclosureDocument[]> {
    const { data, error } = await supabase
      .from("disclosure_documents")
      .select("*")
      .eq("disclosure_id", disclosureId)
      .order("document_type", { ascending: true });
    
    if (error) throw error;
    return (data || []) as DisclosureDocument[];
  }

  /**
   * جلب مستندات الإفصاح مع المحتوى المستخرج
   */
  static async getSmartDocuments(disclosureId: string): Promise<SmartDisclosureDocument[]> {
    const { data, error } = await supabase
      .from("disclosure_documents")
      .select("*")
      .eq("disclosure_id", disclosureId)
      .order("document_type", { ascending: true });
    
    if (error) throw error;
    return (data || []) as SmartDisclosureDocument[];
  }

  /**
   * جلب مستفيدي الإفصاح
   */
  static async getBeneficiaries(disclosureId: string) {
    const { data, error } = await supabase
      .from("disclosure_beneficiaries")
      .select("*")
      .eq("disclosure_id", disclosureId);
    
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب العقارات مع العقود للإفصاح
   */
  static async getPropertiesWithContracts() {
    const { data, error } = await supabase
      .from("properties")
      .select(`*, contracts:contracts(*)`)
      .order("name");
    
    if (error) throw error;
    return data || [];
  }
}
