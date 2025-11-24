import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface PaymentData {
  payment_type: "receipt" | "payment";
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "cheque" | "card";
  payer_name: string;
  reference_number?: string;
  description: string;
  notes?: string;
}

/**
 * خدمة إدارة المدفوعات
 * تتضمن جميع العمليات المتعلقة بالمدفوعات من إنشاء وتحديث وحذف
 */
export class PaymentService {
  /**
   * إنشاء مدفوعة جديدة
   * يتضمن: التحقق، الإنشاء، إنشاء قيد محاسبي تلقائي (عبر Trigger)
   */
  static async create(data: PaymentData) {
    try {
      // 1. التحقق من البيانات
      this.validatePaymentData(data);

      // 2. توليد رقم السند تلقائياً إذا لم يكن موجوداً
      if (!data.payment_number) {
        data.payment_number = await this.generatePaymentNumber(data.payment_type);
      }

      // 3. إنشاء المدفوعة
      // (سيتم إنشاء القيد المحاسبي تلقائياً عبر Trigger: create_journal_entry_for_payment)
      const { data: payment, error: insertError } = await supabase
        .from("payments")
        .insert([data])
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. تسجيل النشاط
      await this.logActivity(
        `تم إنشاء ${data.payment_type === "receipt" ? "سند قبض" : "سند صرف"} - ${data.payer_name} - ${data.amount} ريال`
      );

      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      logger.error(error, {
        context: "create_payment",
        severity: "high",
      });
      throw error;
    }
  }

  /**
   * تحديث مدفوعة موجودة
   */
  static async update(id: string, updates: Partial<PaymentData>) {
    try {
      const { data: payment, error: updateError } = await supabase
        .from("payments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      await this.logActivity(`تم تحديث السند - ${payment.payment_number}`);

      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      logger.error(error, {
        context: "update_payment",
        severity: "medium",
      });
      throw error;
    }
  }

  /**
   * حذف مدفوعة
   */
  static async delete(id: string) {
    try {
      // الحصول على بيانات المدفوعة قبل الحذف
      const { data: payment } = await supabase
        .from("payments")
        .select("payment_number")
        .eq("id", id)
        .single();

      const { error: deleteError } = await supabase
        .from("payments")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      if (payment) {
        await this.logActivity(`تم حذف السند - ${payment.payment_number}`);
      }

      return {
        success: true,
      };
    } catch (error) {
      logger.error(error, {
        context: "delete_payment",
        severity: "high",
      });
      throw error;
    }
  }

  /**
   * التحقق من صحة بيانات المدفوعة
   */
  private static validatePaymentData(data: PaymentData) {
    if (!data.payment_type) {
      throw new Error("نوع السند مطلوب");
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error("المبلغ يجب أن يكون أكبر من صفر");
    }

    if (!data.payer_name || data.payer_name.trim() === "") {
      throw new Error("اسم الدافع مطلوب");
    }

    if (!data.payment_date) {
      throw new Error("تاريخ الدفع مطلوب");
    }

    if (!data.description || data.description.trim() === "") {
      throw new Error("الوصف مطلوب");
    }
  }

  /**
   * توليد رقم سند تلقائياً
   */
  private static async generatePaymentNumber(type: "receipt" | "payment"): Promise<string> {
    try {
      const prefix = type === "receipt" ? "RC" : "PY";
      
      const { count } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("payment_type", type);

      const nextNumber = (count || 0) + 1;
      return `${prefix}-${new Date().getFullYear()}-${String(nextNumber).padStart(6, "0")}`;
    } catch (error) {
      logger.error(error, {
        context: "generate_payment_number",
        severity: "low",
      });
      return `${type === "receipt" ? "RC" : "PY"}-${Date.now()}`;
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
        context: "log_payment_activity",
        severity: "low",
      });
    }
  }
}
