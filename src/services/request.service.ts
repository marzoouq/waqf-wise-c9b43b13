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
   * إنشاء طلب جديد
   */
  static async create(data: RequestData): Promise<{ success: boolean; id?: string; message: string }> {
    try {
      // 1. Validation
      if (!data.beneficiary_id || !data.request_type_id || !data.description) {
        return {
          success: false,
          message: 'البيانات المطلوبة ناقصة',
        };
      }

      // 2. إنشاء الطلب
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

      // 3. تسجيل النشاط
      productionLogger.info(`تم إنشاء طلب جديد ${request.request_number}`);

      // 4. الإشعارات تتم تلقائياً عبر trigger

      return {
        success: true,
        id: request.id,
        message: 'تم تقديم الطلب بنجاح',
      };
    } catch (error) {
      productionLogger.error('Error in RequestService.create', error, {
        context: 'request_service',
      });
      return {
        success: false,
        message: 'فشل في إنشاء الطلب',
      };
    }
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
      .select('*')
      .eq('request_id', requestId)
      .single();

    if (error) throw error;
    return data;
  }
}
