import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface VoucherData {
  voucher_type: string;
  amount: number;
  beneficiary_id?: string;
  payment_method?: string;
  description: string;
  notes?: string;
  distribution_id?: string;
  bank_account_id?: string;
  created_by?: string;
}

/**
 * خدمة إدارة سندات الصرف والقبض
 * التوليد التلقائي للأرقام والقيود المحاسبية
 */
export class VoucherService {
  /**
   * إنشاء سند جديد (سيتم توليد الرقم تلقائياً من قاعدة البيانات)
   */
  static async create(data: VoucherData) {
    try {
      // 1. التحقق من البيانات
      this.validateVoucherData(data);

      // 2. إنشاء السند (الرقم والتاريخ سيتم توليدهما تلقائياً من قاعدة البيانات)
      const insertData: any = {
        voucher_type: data.voucher_type,
        amount: data.amount,
        description: data.description,
        status: "pending",
      };

      // إضافة الحقول الاختيارية فقط إذا كانت موجودة
      if (data.beneficiary_id) insertData.beneficiary_id = data.beneficiary_id;
      if (data.payment_method) insertData.payment_method = data.payment_method;
      if (data.notes) insertData.notes = data.notes;
      if (data.distribution_id) insertData.distribution_id = data.distribution_id;
      if (data.bank_account_id) insertData.bank_account_id = data.bank_account_id;
      if (data.created_by) insertData.created_by = data.created_by;

      const { data: voucher, error: insertError } = await supabase
        .from("payment_vouchers")
        .insert([insertData])
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. تسجيل النشاط
      await this.logActivity(
        `تم إنشاء ${data.voucher_type === "receipt" ? "سند قبض" : "سند صرف"} رقم ${voucher.voucher_number} - ${data.amount} ريال`
      );

      return {
        success: true,
        data: voucher,
      };
    } catch (error) {
      logger.error(error, {
        context: "create_voucher",
        severity: "high",
      });
      throw error;
    }
  }

  /**
   * تحديث حالة السند إلى مدفوع (سينشئ قيد محاسبي تلقائياً)
   */
  static async markAsPaid(voucherId: string) {
    try {
      const { data: voucher, error: updateError } = await supabase
        .from("payment_vouchers")
        .update({ 
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", voucherId)
        .select()
        .single();

      if (updateError) throw updateError;

      await this.logActivity(
        `تم تحديث حالة السند ${voucher.voucher_number} إلى مدفوع`
      );

      return {
        success: true,
        data: voucher,
      };
    } catch (error) {
      logger.error(error, {
        context: "mark_voucher_paid",
        severity: "medium",
      });
      throw error;
    }
  }

  /**
   * حذف سند
   */
  static async delete(voucherId: string) {
    try {
      const { data: voucher } = await supabase
        .from("payment_vouchers")
        .select("voucher_number, status")
        .eq("id", voucherId)
        .single();

      if (voucher?.status === "paid") {
        throw new Error("لا يمكن حذف سند مدفوع");
      }

      const { error: deleteError } = await supabase
        .from("payment_vouchers")
        .delete()
        .eq("id", voucherId);

      if (deleteError) throw deleteError;

      if (voucher) {
        await this.logActivity(`تم حذف السند ${voucher.voucher_number}`);
      }

      return {
        success: true,
      };
    } catch (error) {
      logger.error(error, {
        context: "delete_voucher",
        severity: "high",
      });
      throw error;
    }
  }

  /**
   * التحقق من صحة بيانات السند
   */
  private static validateVoucherData(data: VoucherData) {
    if (!data.voucher_type) {
      throw new Error("نوع السند مطلوب");
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error("المبلغ يجب أن يكون أكبر من صفر");
    }

    if (!data.description || data.description.trim() === "") {
      throw new Error("الوصف مطلوب");
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
        context: "log_voucher_activity",
        severity: "low",
      });
    }
  }

  /**
   * توليد سندات من توزيع (مبسط - بحاجة لهيكل distribution_lines)
   */
  static async generateVouchersFromDistribution(distributionId: string) {
    try {
      // الحصول على بيانات التوزيع
      const { data: distribution, error: distError } = await supabase
        .from("distributions")
        .select("*")
        .eq("id", distributionId)
        .single();

      if (distError) throw distError;
      if (!distribution) throw new Error("التوزيع غير موجود");

      // TODO: Add actual distribution lines logic when table exists
      // For now, create a single voucher for testing
      const voucherData: VoucherData = {
        voucher_type: "payment",
        amount: distribution.total_amount || 0,
        description: `توزيع بتاريخ ${distribution.distribution_date}`,
        distribution_id: distributionId,
        payment_method: "bank_transfer",
      };

      const result = await this.create(voucherData);

      await this.logActivity(
        `تم توليد سند من التوزيع بتاريخ ${distribution.distribution_date}`
      );

      return {
        success: true,
        count: 1,
        vouchers: [result.data],
      };
    } catch (error) {
      logger.error(error, {
        context: "generate_vouchers_from_distribution",
        severity: "high",
      });
      throw error;
    }
  }
}
