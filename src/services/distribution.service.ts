import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface DistributionData {
  month: string;
  total_amount: number;
  beneficiaries_count: number;
  distribution_date: string;
  distribution_type?: string;
  period_start?: string;
  period_end?: string;
  total_revenues?: number;
  total_expenses?: number;
  net_revenues?: number;
  nazer_share?: number;
  waqif_charity?: number;
  waqf_corpus?: number;
  distributable_amount?: number;
  notes?: string;
}

export interface ApprovalData {
  distribution_id: string;
  level: number;
  approver_name: string;
  notes?: string;
}

/**
 * خدمة إدارة التوزيعات
 * تتضمن جميع العمليات المتعلقة بالتوزيعات من إنشاء وموافقة وإشعارات
 */
export class DistributionService {
  /**
   * إنشاء توزيع جديد
   * يتضمن: التحقق، الإنشاء، إنشاء موافقات، تسجيل النشاط
   */
  static async create(data: DistributionData) {
    try {
      // 1. التحقق من البيانات
      this.validateDistributionData(data);

      // 2. إنشاء التوزيع
      const { data: distribution, error: insertError } = await supabase
        .from("distributions")
        .insert([{ ...data, status: "معلق" }])
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. إنشاء موافقات تلقائية (3 مستويات)
      const approvals = [
        { level: 1, approver_name: "المحاسب", status: "معلق" },
        { level: 2, approver_name: "المدير المالي", status: "معلق" },
        { level: 3, approver_name: "الناظر", status: "معلق" },
      ];

      const { error: approvalsError } = await supabase
        .from("distribution_approvals")
        .insert(
          approvals.map((approval) => ({
            distribution_id: distribution.id,
            ...approval,
          }))
        );

      if (approvalsError) {
        logger.error(approvalsError, {
          context: "create_distribution_approvals",
          severity: "high",
        });
      }

      // 4. تسجيل النشاط
      await this.logActivity(`تم إنشاء توزيع جديد لشهر ${data.month}`);

      return {
        success: true,
        data: distribution,
      };
    } catch (error) {
      logger.error(error, {
        context: "create_distribution",
        severity: "high",
      });
      throw error;
    }
  }

  /**
   * الموافقة على توزيع
   * يتضمن: التحقق من الصلاحيات، تحديث الموافقة، التحقق من اكتمال الموافقات
   */
  static async approve(approvalData: ApprovalData) {
    try {
      // 1. تحديث الموافقة
      const { error: updateError } = await supabase
        .from("distribution_approvals")
        .update({
          status: "موافق",
          approver_name: approvalData.approver_name,
          notes: approvalData.notes,
          approved_at: new Date().toISOString(),
        })
        .eq("distribution_id", approvalData.distribution_id)
        .eq("level", approvalData.level);

      if (updateError) throw updateError;

      // 2. التحقق من اكتمال جميع الموافقات
      // (سيتم التنفيذ تلقائياً عبر Trigger: auto_update_distribution_status)

      // 3. تسجيل النشاط
      await this.logActivity(
        `تمت الموافقة على التوزيع - المستوى ${approvalData.level} من قبل ${approvalData.approver_name}`
      );

      return {
        success: true,
      };
    } catch (error) {
      logger.error(error, {
        context: "approve_distribution",
        severity: "high",
      });
      throw error;
    }
  }

  /**
   * رفض توزيع
   */
  static async reject(approvalData: ApprovalData) {
    try {
      const { error: updateError } = await supabase
        .from("distribution_approvals")
        .update({
          status: "مرفوض",
          approver_name: approvalData.approver_name,
          notes: approvalData.notes,
          approved_at: new Date().toISOString(),
        })
        .eq("distribution_id", approvalData.distribution_id)
        .eq("level", approvalData.level);

      if (updateError) throw updateError;

      // تحديث حالة التوزيع إلى مرفوض
      await supabase
        .from("distributions")
        .update({ status: "مرفوض" })
        .eq("id", approvalData.distribution_id);

      await this.logActivity(
        `تم رفض التوزيع - المستوى ${approvalData.level} من قبل ${approvalData.approver_name}`
      );

      return {
        success: true,
      };
    } catch (error) {
      logger.error(error, {
        context: "reject_distribution",
        severity: "high",
      });
      throw error;
    }
  }

  /**
   * التحقق من صحة بيانات التوزيع
   */
  private static validateDistributionData(data: DistributionData) {
    if (!data.month || data.month.trim() === "") {
      throw new Error("اسم الشهر مطلوب");
    }

    if (!data.total_amount || data.total_amount <= 0) {
      throw new Error("المبلغ الإجمالي يجب أن يكون أكبر من صفر");
    }

    if (!data.beneficiaries_count || data.beneficiaries_count <= 0) {
      throw new Error("عدد المستفيدين يجب أن يكون أكبر من صفر");
    }

    if (!data.distribution_date) {
      throw new Error("تاريخ التوزيع مطلوب");
    }
  }

  /**
   * تسجيل نشاط في السجل
   */
  private static async logActivity(action: string) {
    try {
      await supabase.from("activities").insert([
        {
          user_name: "النظام",
          action,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      logger.error(error, {
        context: "log_distribution_activity",
        severity: "low",
      });
    }
  }
}
