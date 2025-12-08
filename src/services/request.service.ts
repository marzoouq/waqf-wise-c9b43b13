/**
 * Request Service - خدمة إدارة الطلبات
 * 
 * تتولى منطق الأعمال لنظام طلبات المستفيدين
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';

export interface RequestData {
  beneficiary_id: string;
  request_type_id: string;
  description: string;
  amount?: number;
  priority?: 'منخفضة' | 'متوسطة' | 'عالية' | 'عاجلة';
}

export class RequestService {
  /**
   * جلب أنواع الطلبات
   */
  static async getRequestTypes() {
    const { data, error } = await supabase
      .from('request_types')
      .select('id, name_ar, name_en, description, sla_hours, is_active, created_at')
      .eq('is_active', true)
      .order('name_ar', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب جميع الطلبات
   */
  static async getAll(beneficiaryId?: string) {
    let query = supabase
      .from('beneficiary_requests')
      .select(`
        *,
        request_type:request_types(name_ar, description),
        beneficiary:beneficiaries(full_name)
      `)
      .order('submitted_at', { ascending: false });

    if (beneficiaryId) {
      query = query.eq('beneficiary_id', beneficiaryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب طلب بالمعرف
   */
  static async getById(requestId: string) {
    const { data, error } = await supabase
      .from('beneficiary_requests')
      .select(`
        *,
        request_type:request_types(name_ar, description),
        beneficiary:beneficiaries(full_name)
      `)
      .eq('id', requestId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * إنشاء طلب جديد
   */
  static async create(data: RequestData): Promise<{ success: boolean; id?: string; message: string }> {
    try {
      if (!data.beneficiary_id || !data.request_type_id || !data.description) {
        return { success: false, message: 'البيانات المطلوبة ناقصة' };
      }

      const { data: request, error } = await supabase
        .from('beneficiary_requests')
        .insert({
          beneficiary_id: data.beneficiary_id,
          request_type_id: data.request_type_id,
          description: data.description,
          amount: data.amount,
          priority: data.priority || 'متوسطة',
          status: 'قيد المراجعة',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      productionLogger.info(`تم إنشاء طلب جديد ${request.request_number}`);

      return { success: true, id: request.id, message: 'تم تقديم الطلب بنجاح' };
    } catch (error) {
      productionLogger.error('Error in RequestService.create', error, { context: 'request_service' });
      return { success: false, message: 'فشل في إنشاء الطلب' };
    }
  }

  /**
   * تحديث طلب
   */
  static async update(id: string, updates: Partial<RequestData>) {
    const { data, error } = await supabase
      .from('beneficiary_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * حذف طلب
   */
  static async delete(id: string) {
    const { error } = await supabase
      .from('beneficiary_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * مراجعة طلب (موافقة/رفض)
   */
  static async review(
    id: string,
    status: 'موافق' | 'مرفوض',
    decision_notes?: string,
    rejection_reason?: string
  ) {
    const updates: Record<string, string | undefined> = {
      status,
      decision_notes,
      rejection_reason,
      reviewed_at: new Date().toISOString(),
    };

    if (status === 'موافق') {
      updates.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('beneficiary_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * الموافقة على طلب
   */
  static async approve(
    requestId: string,
    approverId: string,
    approverName: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. تحديث حالة الطلب
      const { error: updateError } = await supabase
        .from('beneficiary_requests')
        .update({
          status: 'موافق عليه',
          approved_at: new Date().toISOString(),
          decision_notes: notes,
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // 2. تحديث workflow
      const { error: workflowError } = await supabase
        .from('request_workflows')
        .update({
          workflow_status: 'completed',
        })
        .eq('request_id', requestId);

      if (workflowError) throw workflowError;

      // 3. تسجيل النشاط
      productionLogger.info(`تمت الموافقة على الطلب ${requestId} بواسطة ${approverName}`);

      // 4. الإشعار يتم إرساله تلقائياً عبر trigger

      return {
        success: true,
        message: 'تمت الموافقة على الطلب',
      };
    } catch (error) {
      productionLogger.error('Error in RequestService.approve', error, {
        context: 'request_service',
      });
      return {
        success: false,
        message: 'فشل في معالجة الموافقة',
      };
    }
  }

  /**
   * رفض طلب
   */
  static async reject(
    requestId: string,
    approverId: string,
    approverName: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error: updateError } = await supabase
        .from('beneficiary_requests')
        .update({
          status: 'مرفوض',
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      const { error: workflowError } = await supabase
        .from('request_workflows')
        .update({
          workflow_status: 'completed',
        })
        .eq('request_id', requestId);

      if (workflowError) throw workflowError;

      productionLogger.info(`تم رفض الطلب ${requestId} بواسطة ${approverName}`);

      return {
        success: true,
        message: 'تم رفض الطلب',
      };
    } catch (error) {
      productionLogger.error('Error in RequestService.reject', error, {
        context: 'request_service',
      });
      return {
        success: false,
        message: 'فشل في معالجة الرفض',
      };
    }
  }

  /**
   * تصعيد طلب
   */
  static async escalate(requestId: string): Promise<{ success: boolean }> {
    try {
      // يتم التصعيد تلقائياً عبر function
      const { error } = await supabase.rpc('escalate_overdue_requests');
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      productionLogger.error('Error in RequestService.escalate', error, {
        context: 'request_service',
      });
      return { success: false };
    }
  }

  /**
   * الحصول على workflow الطلب
   */
  static async getWorkflow(requestId: string) {
    const { data, error } = await supabase
      .from('request_workflows')
      .select('id, request_id, workflow_status, current_step, assigned_to, assigned_at, due_date, sla_hours, escalated_at, escalation_level, created_at, updated_at')
      .eq('request_id', requestId)
      .single();

    if (error) throw error;
    return data;
  }
}
