/**
 * Approval Service - خدمة إدارة الموافقات
 * 
 * تتولى منطق الأعمال لنظام الموافقات متعدد المستويات
 */

import { supabase } from '@/integrations/supabase/client';

export interface ApprovalData {
  reference_id: string;
  reference_type: 'distribution' | 'loan' | 'payment' | 'journal';
  approver_id: string;
  approver_name: string;
  approval_level: number;
  status: 'موافق' | 'مرفوض';
  notes?: string;
}

export class ApprovalService {
  /**
   * الموافقة على توزيع
   */
  static async approveDistribution(
    distributionId: string,
    approverId: string,
    approverName: string,
    level: number,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. إضافة الموافقة
      const { error: approvalError } = await supabase
        .from('distribution_approvals')
        .insert({
          distribution_id: distributionId,
          approver_id: approverId,
          approver_name: approverName,
          level: level,
          status: 'موافق',
          notes,
          approved_at: new Date().toISOString(),
        } as any);

      if (approvalError) throw approvalError;

      // 2. التحقق من اكتمال جميع الموافقات
      const { data: approvals } = await supabase
        .from('distribution_approvals')
        .select('*')
        .eq('distribution_id', distributionId);

      const allApproved = approvals?.length === 3 && 
        approvals.every(a => a.status === 'موافق');

      // 3. إذا اكتملت الموافقات، تحديث حالة التوزيع
      if (allApproved) {
        const { error: updateError } = await supabase
          .from('distributions')
          .update({ status: 'معتمد' })
          .eq('id', distributionId);

        if (updateError) throw updateError;

        console.log(`تم اعتماد التوزيع ${distributionId} بواسطة ${approverName}`);

        return {
          success: true,
          message: 'تم الاعتماد النهائي للتوزيع وإنشاء القيود المحاسبية',
        };
      }

      return {
        success: true,
        message: `تمت الموافقة (${approvals?.filter(a => a.status === 'موافق').length}/3)`,
      };
    } catch (error) {
      console.error('Error in approveDistribution:', error);
      return {
        success: false,
        message: 'فشل في معالجة الموافقة',
      };
    }
  }

  /**
   * رفض توزيع
   */
  static async rejectDistribution(
    distributionId: string,
    approverId: string,
    approverName: string,
    level: number,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. إضافة الرفض
      const { error: approvalError } = await supabase
        .from('distribution_approvals')
        .insert({
          distribution_id: distributionId,
          approver_id: approverId,
          approver_name: approverName,
          level: level,
          status: 'مرفوض',
          notes: reason,
          approved_at: new Date().toISOString(),
        } as any);

      if (approvalError) throw approvalError;

      // 2. تحديث حالة التوزيع إلى مرفوض
      const { error: updateError } = await supabase
        .from('distributions')
        .update({ status: 'مرفوض' })
        .eq('id', distributionId);

      if (updateError) throw updateError;

      console.log(`تم رفض التوزيع ${distributionId} بواسطة ${approverName}`);

      return {
        success: true,
        message: 'تم رفض التوزيع',
      };
    } catch (error) {
      console.error('Error in rejectDistribution:', error);
      return {
        success: false,
        message: 'فشل في معالجة الرفض',
      };
    }
  }

  /**
   * الموافقة على قرض
   */
  static async approveLoan(
    loanId: string,
    approverId: string,
    approverName: string,
    level: number,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error: approvalError } = await supabase
        .from('loan_approvals')
        .insert({
          loan_id: loanId,
          approver_id: approverId,
          approver_name: approverName,
          level: level,
          status: 'موافق',
          notes,
          approved_at: new Date().toISOString(),
        } as any);

      if (approvalError) throw approvalError;

      // التحقق من اكتمال الموافقات
      const { data: approvals } = await supabase
        .from('loan_approvals')
        .select('*')
        .eq('loan_id', loanId);

      const allApproved = approvals?.length >= 2 && 
        approvals.every(a => a.status === 'موافق');

      if (allApproved) {
        await supabase
          .from('loans')
          .update({ status: 'approved' })
          .eq('id', loanId);

        console.log(`تم اعتماد القرض ${loanId} بواسطة ${approverName}`);
      }

      return { success: true, message: 'تمت الموافقة على القرض' };
    } catch (error) {
      console.error('Error in approveLoan:', error);
      return { success: false, message: 'فشل في معالجة الموافقة' };
    }
  }

  /**
   * التحقق من صلاحيات الموافقة
   */
  static async checkApprovalPermission(
    userId: string,
    level: number
  ): Promise<boolean> {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (!data) return false;

    // المستوى 1: المحاسب
    // المستوى 2: المدير المالي
    // المستوى 3: الناظر
    const rolePermissions: Record<string, number> = {
      'accountant': 1,
      'financial_manager': 2,
      'nazer': 3,
      'admin': 3,
    };

    return (rolePermissions[data.role] || 0) >= level;
  }

  /**
   * الحصول على الموافقات لمرجع معين
   */
  static async getApprovals(
    referenceId: string,
    referenceType: 'distribution' | 'loan' | 'payment'
  ) {
    if (referenceType === 'distribution') {
      const { data, error } = await supabase
        .from('distribution_approvals')
        .select('*')
        .eq('distribution_id', referenceId)
        .order('level', { ascending: true });
      if (error) throw error;
      return data;
    } else if (referenceType === 'loan') {
      const { data, error } = await supabase
        .from('loan_approvals')
        .select('*')
        .eq('loan_id', referenceId)
        .order('level', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('payment_approvals')
        .select('*')
        .eq('payment_id', referenceId)
        .order('level', { ascending: true });
      if (error) throw error;
      return data;
    }
  }
}
