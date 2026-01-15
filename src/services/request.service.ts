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
        .maybeSingle();

      if (error) throw error;
      if (!request) throw new Error('فشل إنشاء الطلب');

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
      .maybeSingle();

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
      .maybeSingle();

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
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // ==================== المرفقات ====================
  static async getAttachments(requestId: string) {
    const { data, error } = await supabase
      .from("request_attachments")
      .select("*")
      .eq("request_id", requestId)
      .order("uploaded_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async uploadAttachment(requestId: string, file: File, description?: string) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${requestId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("request-attachments")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("request-attachments")
      .getPublicUrl(fileName);

    const { data, error } = await supabase
      .from("request_attachments")
      .insert({
        request_id: requestId,
        file_name: file.name,
        file_path: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        description,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل رفع المرفق');

    // Update attachments_count
    const { data: currentRequest } = await supabase
      .from("beneficiary_requests")
      .select("attachments_count")
      .eq("id", requestId)
      .maybeSingle();

    if (currentRequest) {
      await supabase
        .from("beneficiary_requests")
        .update({ attachments_count: (currentRequest.attachments_count || 0) + 1 })
        .eq("id", requestId);
    }

    return data;
  }

  static async deleteAttachment(attachmentId: string, filePath: string, requestId: string) {
    const urlParts = filePath.split("/request-attachments/");
    const storagePath = urlParts[1];

    if (storagePath) {
      await supabase.storage.from("request-attachments").remove([storagePath]);
    }

    const { error } = await supabase
      .from("request_attachments")
      .delete()
      .eq("id", attachmentId);

    if (error) throw error;

    const { data: currentRequest } = await supabase
      .from("beneficiary_requests")
      .select("attachments_count")
      .eq("id", requestId)
      .maybeSingle();

    if (currentRequest) {
      await supabase
        .from("beneficiary_requests")
        .update({ attachments_count: Math.max((currentRequest.attachments_count || 0) - 1, 0) })
        .eq("id", requestId);
    }
  }

  // ==================== التعليقات ====================
  static async getComments(requestId: string) {
    // جلب التعليقات
    const { data: comments, error } = await supabase
      .from("request_comments")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!comments || comments.length === 0) return [];

    // جمع جميع user_ids الفريدة
    const userIds = [...new Set(comments.filter(c => c.user_id).map(c => c.user_id))];
    
    // استعلام واحد لجلب جميع الملفات الشخصية (بدلاً من N استعلام)
    let profilesMap: Record<string, { full_name: string; email: string }> = {};
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);
      
      if (profiles) {
        profilesMap = profiles.reduce((acc, p) => {
          acc[p.user_id] = { full_name: p.full_name || "مستخدم", email: p.email || "" };
          return acc;
        }, {} as Record<string, { full_name: string; email: string }>);
      }
    }

    // دمج البيانات
    return comments.map((comment) => ({
      ...comment,
      profiles: comment.user_id && profilesMap[comment.user_id] 
        ? profilesMap[comment.user_id] 
        : { full_name: "مستخدم", email: "" },
    }));
  }

  static async addComment(requestId: string, comment: string, isInternal = false) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("غير مصرح");

    const { data, error } = await supabase
      .from("request_comments")
      .insert([{ request_id: requestId, comment, is_internal: isInternal, user_id: user.id }])
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل إضافة التعليق');
    return data;
  }

  static async updateComment(id: string, comment: string) {
    const { data, error } = await supabase
      .from("request_comments")
      .update({ comment })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async deleteComment(id: string) {
    const { error } = await supabase
      .from("request_comments")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * جلب جميع الطلبات مع بيانات المستفيد (للموظفين)
   */
  static async getAllWithBeneficiary() {
    const { data, error } = await supabase
      .from('beneficiary_requests')
      .select(`
        *,
        beneficiary:beneficiaries(
          full_name,
          national_id,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * تحديث حالة الطلب
   */
  static async updateRequestStatus(requestId: string, status: string, notes: string) {
    const { error } = await supabase
      .from('beneficiary_requests')
      .update({
        status,
        decision_notes: notes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
  }
}
