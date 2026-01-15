/**
 * Disclosure Service - خدمة الإفصاحات السنوية الموحدة
 * @version 2.9.0
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { logger } from "@/lib/logger";

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

  // ==================== الدوال المنقولة من report/disclosure.service ====================

  /**
   * جلب آخر إفصاح سنوي (للتوافق مع ReportService)
   */
  static async getLatestAnnualDisclosure() {
    return this.getLatest();
  }

  /**
   * جلب الإفصاحات السنوية مع حقول محددة
   */
  static async getAnnualDisclosures() {
    const { data, error } = await supabase
      .from("annual_disclosures")
      .select("id, year, waqf_name, fiscal_year_id, disclosure_date, opening_balance, closing_balance, total_revenues, total_expenses, administrative_expenses, maintenance_expenses, development_expenses, other_expenses, net_income, nazer_percentage, nazer_share, charity_percentage, charity_share, corpus_percentage, corpus_share, sons_count, daughters_count, wives_count, total_beneficiaries, status, published_at, published_by, bank_statement_url, beneficiaries_details, expenses_breakdown, revenue_breakdown, vat_amount, monthly_data, created_at, updated_at")
      .order("year", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب الإفصاح السنوي الحالي
   */
  static async getCurrentYearDisclosure() {
    const currentYear = new Date().getFullYear();
    const { data, error } = await supabase
      .from("annual_disclosures")
      .select("id, year, waqf_name, fiscal_year_id, disclosure_date, opening_balance, closing_balance, total_revenues, total_expenses, administrative_expenses, maintenance_expenses, development_expenses, other_expenses, net_income, nazer_percentage, nazer_share, charity_percentage, charity_share, corpus_percentage, corpus_share, sons_count, daughters_count, wives_count, total_beneficiaries, status, published_at, published_by, bank_statement_url, beneficiaries_details, expenses_breakdown, revenue_breakdown, vat_amount, monthly_data, created_at, updated_at")
      .eq("year", currentYear)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * توليد إفصاح سنوي
   */
  static async generateAnnualDisclosure(year: number, waqfName: string) {
    const { data, error } = await supabase.rpc("generate_annual_disclosure", {
      p_year: year,
      p_waqf_name: waqfName,
    });

    if (error) throw error;
    return data;
  }

  /**
   * نشر إفصاح سنوي
   */
  static async publishDisclosure(disclosureId: string) {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("annual_disclosures")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        published_by: userData.user?.id,
      })
      .eq("id", disclosureId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('الإفصاح غير موجود');
    
    try {
      await supabase.functions.invoke('notify-disclosure-published', {
        body: { disclosure_id: disclosureId }
      });
    } catch (err) {
      logger.error(err, { context: 'notify_disclosure_published' });
    }
    
    return data;
  }

  /**
   * جلب مستفيدي الإفصاح مع حقول محددة
   */
  static async getDisclosureBeneficiaries(disclosureId: string) {
    const { data, error } = await supabase
      .from("disclosure_beneficiaries")
      .select("id, disclosure_id, beneficiary_id, beneficiary_name, beneficiary_type, relationship, allocated_amount, payments_count, created_at")
      .eq("disclosure_id", disclosureId)
      .order("allocated_amount", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب المستفيدين المرتبطين بالإفصاح للتصدير PDF
   */
  static async getDisclosureBeneficiariesForPDF(disclosureId: string) {
    const { data, error } = await supabase
      .from('disclosure_beneficiaries')
      .select('*')
      .eq('disclosure_id', disclosureId);

    if (error) throw error;
    return data || [];
  }
}
