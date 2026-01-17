/**
 * Contract Service - خدمة العقود
 * @version 2.9.12 - إضافة matchesStatus و withRetry
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { CONTRACT_STATUS, matchesStatus } from "@/lib/constants";
import { withRetry, SUPABASE_RETRY_OPTIONS } from "@/lib/retry-helper";
import type { PaginatedResponse, PaginationParams } from "@/lib/pagination.types";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination.types";
import { archiveDocument, pdfToBlob } from "@/lib/archiveDocument";
import { generateContractPDF } from "@/lib/pdf/generateContractPDF";
import { logger } from "@/lib/logger";

type Contract = Database['public']['Tables']['contracts']['Row'];
type ContractInsert = Database['public']['Tables']['contracts']['Insert'];

export class ContractService {
  static async getAll(filters?: { status?: string; propertyId?: string }): Promise<Contract[]> {
    let query = supabase.from('contracts').select('*').order('created_at', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.propertyId) query = query.eq('property_id', filters.propertyId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getAllWithProperties() {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        properties(name, type, location)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب العقود مع الترقيم من السيرفر
   */
  static async getPaginated(
    params: PaginationParams = { page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE },
    filters?: { status?: string; propertyId?: string }
  ): Promise<PaginatedResponse<Contract & { properties?: { name: string; type: string; location: string } | null }>> {
    const { page, pageSize } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // جلب العدد الكلي
    let countQuery = supabase.from('contracts').select('*', { count: 'exact', head: true });
    if (filters?.status) countQuery = countQuery.eq('status', filters.status);
    if (filters?.propertyId) countQuery = countQuery.eq('property_id', filters.propertyId);
    const { count } = await countQuery;

    // جلب البيانات
    let dataQuery = supabase
      .from('contracts')
      .select(`*, properties(name, type, location)`)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (filters?.status) dataQuery = dataQuery.eq('status', filters.status);
    if (filters?.propertyId) dataQuery = dataQuery.eq('property_id', filters.propertyId);
    
    const { data, error } = await dataQuery;
    if (error) throw error;

    const totalCount = count || 0;
    return {
      data: data || [],
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  static async getById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase.from('contracts').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  static async getByPropertyId(propertyId: string): Promise<Contract[]> {
    const { data, error } = await supabase.from('contracts').select('*').eq('property_id', propertyId);
    if (error) throw error;
    return data || [];
  }

  static async create(contract: ContractInsert & { unit_ids?: string[] }): Promise<Contract> {
    const { unit_ids, ...contractData } = contract;
    
    const { data, error } = await supabase
      .from('contracts')
      .insert([contractData])
      .select()
      .maybeSingle();

    if (error) {
      // تحسين رسائل الخطأ للمستخدم
      if (error.code === '23503') {
        const customError = new Error('بيانات المستأجر أو العقار غير صالحة. يرجى التحقق من البيانات.');
        (customError as any).code = '23503';
        throw customError;
      }
      if (error.message?.includes('occupied_units_check')) {
        const customError = new Error('يوجد تعارض في عدد الوحدات المشغولة');
        (customError as any).code = 'occupied_units_check';
        throw customError;
      }
      throw error;
    }
    if (!data) throw new Error('فشل إنشاء العقد');

    // ربط الوحدات بالعقد - الـ Trigger يحدث حالة الوحدات تلقائياً
    if (data && unit_ids && unit_ids.length > 0) {
      const contractUnits = unit_ids.map(unitId => ({
        contract_id: data.id,
        property_unit_id: unitId,
      }));

      const { error: unitsError } = await supabase
        .from('contract_units')
        .insert(contractUnits);

      if (unitsError) {
        logger.error(unitsError, { context: 'contract_units_insert', severity: 'medium' });
      }

      // ملاحظة: تم إزالة التحديث اليدوي للوحدات - الـ Trigger يفعل ذلك تلقائياً
    }

    // إنشاء جدول الدفعات تلقائياً
    if (data) {
      await supabase.rpc('create_payment_schedule', {
        p_contract_id: data.id,
        p_start_date: data.start_date,
        p_end_date: data.end_date,
        p_monthly_rent: data.monthly_rent,
        p_payment_frequency: data.payment_frequency
      });

      // أرشفة العقد تلقائياً
      this.archiveContract(data).catch(err => {
        logger.error(err, { context: 'contract_auto_archive', severity: 'medium' });
      });
    }

    return data;
  }

  /**
   * أرشفة عقد في نظام الأرشيف
   */
  static async archiveContract(contract: Contract): Promise<void> {
    try {
      // جلب بيانات العقار
      let propertyData = null;
      if (contract.property_id) {
        const { data } = await supabase
          .from('properties')
          .select('name, type, location')
          .eq('id', contract.property_id)
          .maybeSingle();
        propertyData = data;
      }

      // توليد PDF
      const pdfDoc = await generateContractPDF({
        id: contract.id,
        contract_number: contract.contract_number || `CNT-${contract.id.slice(0, 8)}`,
        tenant_name: contract.tenant_name || 'غير محدد',
        monthly_rent: contract.monthly_rent || 0,
        start_date: contract.start_date || '',
        end_date: contract.end_date || '',
        status: contract.status || 'نشط',
        payment_frequency: contract.payment_frequency || 'شهري',
        tenant_phone: contract.tenant_phone || undefined,
        tenant_national_id: contract.tenant_id_number || undefined,
        notes: contract.notes || undefined,
        property: propertyData,
      });

      const pdfBlob = pdfToBlob(pdfDoc);
      const fileName = `عقد_${contract.contract_number || contract.id.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;

      await archiveDocument({
        fileBlob: pdfBlob,
        fileName,
        fileType: 'contract',
        referenceId: contract.id,
        referenceType: 'contract',
        description: `عقد إيجار - ${contract.tenant_name} - ${contract.contract_number}`,
      });

      logger.info('تم أرشفة العقد بنجاح', { 
        context: 'contract_archived', 
        metadata: { contractId: contract.id } 
      });
    } catch (error) {
      logger.error(error, { context: 'archive_contract_error', severity: 'medium' });
    }
  }

  static async update(id: string, updates: Partial<Contract>): Promise<Contract | null> {
    const { data, error } = await supabase.from('contracts').update(updates).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('contracts').delete().eq('id', id);
    if (error) throw error;
  }

  static async terminate(id: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .update({ status: 'منتهي' })
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;

    // تحرير الوحدات المربوطة (احتياطي - الـ Trigger يفعل ذلك أيضاً)
    await supabase
      .from('property_units')
      .update({
        current_contract_id: null,
        current_tenant_id: null,
        occupancy_status: 'شاغر',
        updated_at: new Date().toISOString()
      })
      .eq('current_contract_id', id);

    return data;
  }

  static async getExpiringSoon(days: number = 30): Promise<Contract[]> {
    const future = new Date();
    future.setDate(future.getDate() + days);
    const { data, error } = await supabase.from('contracts').select('*')
      .eq('status', CONTRACT_STATUS.ACTIVE)
      .lte('end_date', future.toISOString().split('T')[0]);
    if (error) throw error;
    return data || [];
  }

  static async getStats() {
    const contracts = await withRetry(() => this.getAll(), SUPABASE_RETRY_OPTIONS);
    return {
      total: contracts.length,
      active: contracts.filter(c => matchesStatus(c.status, 'active')).length,
      expired: contracts.filter(c => matchesStatus(c.status, 'expired')).length,
      totalRent: contracts.filter(c => matchesStatus(c.status, 'active')).reduce((s, c) => s + (c.monthly_rent || 0), 0),
    };
  }

  static async getActiveWithProperties(): Promise<{
    id: string;
    contract_number: string;
    tenant_name: string;
    monthly_rent: number;
    start_date: string;
    end_date: string;
    status: string;
    properties: {
      name: string;
      type: string;
      location: string;
    } | null;
  }[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        id,
        contract_number,
        tenant_name,
        monthly_rent,
        start_date,
        end_date,
        status,
        properties (
          name,
          type,
          location
        )
      `)
      .eq('status', 'نشط')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as {
      id: string;
      contract_number: string;
      tenant_name: string;
      monthly_rent: number;
      start_date: string;
      end_date: string;
      status: string;
      properties: {
        name: string;
        type: string;
        location: string;
      } | null;
    }[];
  }
}
