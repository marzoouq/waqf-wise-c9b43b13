import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

type PaymentVoucherInsert = Database['public']['Tables']['payment_vouchers']['Insert'];
type PaymentVoucher = Database['public']['Tables']['payment_vouchers']['Row'];

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

export interface DistributionLineItem {
  beneficiary_id: string;
  beneficiary_name: string;
  amount: number;
  percentage?: number;
  iban?: string;
  bank_name?: string;
}

export interface VoucherWithDetails extends PaymentVoucher {
  beneficiaries?: {
    full_name: string;
    national_id: string;
  } | null;
  distributions?: {
    total_amount: number;
    distribution_date: string;
  } | null;
}

/**
 * خدمة إدارة سندات الصرف والقبض
 * التوليد التلقائي للأرقام والقيود المحاسبية
 */
export class VoucherService {
  /**
   * توليد رقم سند تلقائي
   */
  private static generateVoucherNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `V-${timestamp}-${random}`;
  }

  /**
   * إنشاء سند جديد
   */
  static async create(data: VoucherData) {
    try {
      // 1. التحقق من البيانات
      this.validateVoucherData(data);

      // 2. إنشاء السند مع رقم تلقائي
      const insertData: PaymentVoucherInsert = {
        voucher_number: this.generateVoucherNumber(),
        voucher_type: data.voucher_type,
        amount: data.amount,
        description: data.description,
        status: "pending",
        beneficiary_id: data.beneficiary_id,
        payment_method: data.payment_method,
        notes: data.notes,
        distribution_id: data.distribution_id,
        bank_account_id: data.bank_account_id,
        created_by: data.created_by,
      };

      const { data: voucher, error: insertError } = await supabase
        .from("payment_vouchers")
        .insert([insertData])
        .select()
        .maybeSingle();

      if (insertError) throw insertError;
      if (!voucher) throw new Error('فشل إنشاء السند');

      // 3. ربط السند بقيد محاسبي تلقائياً
      if (data.voucher_type === 'payment') {
        try {
          const { error: linkError } = await supabase.functions.invoke('link-voucher-journal', {
            body: { 
              voucher_id: voucher.id, 
              create_journal: true 
            }
          });
          
          if (linkError) {
            logger.error(linkError, {
              context: 'auto_link_voucher_journal',
              severity: 'medium',
              metadata: { voucher_id: voucher.id },
            });
          } else {
            console.log('[VoucherService] ✅ تم ربط السند بقيد محاسبي:', voucher.voucher_number);
          }
        } catch (linkErr) {
          // تسجيل الخطأ لكن لا نوقف العملية
          logger.error(linkErr, {
            context: 'auto_link_voucher_journal',
            severity: 'medium',
          });
        }
      }

      // 4. تسجيل النشاط
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
   * تحديث حالة السند إلى مدفوع (سينشئ قيد محاسبي تلقائياً إذا لم يكن موجوداً)
   */
  static async markAsPaid(voucherId: string) {
    try {
      // جلب السند للتحقق من وجود قيد
      const { data: existingVoucher } = await supabase
        .from("payment_vouchers")
        .select("id, voucher_number, journal_entry_id, voucher_type")
        .eq("id", voucherId)
        .maybeSingle();
      
      if (!existingVoucher) {
        throw new Error("السند غير موجود");
      }

      // إنشاء قيد إذا لم يكن موجوداً
      if (existingVoucher && !existingVoucher.journal_entry_id && existingVoucher.voucher_type === 'payment') {
        try {
          await supabase.functions.invoke('link-voucher-journal', {
            body: { voucher_id: voucherId, create_journal: true }
          });
          console.log('[VoucherService] ✅ تم إنشاء قيد للسند:', existingVoucher.voucher_number);
        } catch (linkErr) {
          logger.error(linkErr, {
            context: 'mark_paid_link_journal',
            severity: 'medium',
          });
        }
      }

      const { data: voucher, error: updateError } = await supabase
        .from("payment_vouchers")
        .update({ 
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", voucherId)
        .select()
        .maybeSingle();

      if (updateError) throw updateError;
      if (!voucher) throw new Error('السند غير موجود');

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
        .maybeSingle();

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
   * الحصول على بنود التوزيع للمستفيدين
   */
  private static async getDistributionLines(distributionId: string): Promise<DistributionLineItem[]> {
    // جلب بيانات التوزيع
    const { data: distribution, error: distError } = await supabase
      .from("distributions")
      .select("*")
      .eq("id", distributionId)
      .maybeSingle();

    if (distError) throw distError;
    if (!distribution) throw new Error("التوزيع غير موجود");

    // جلب المستفيدين المرتبطين بالتوزيع من payment_vouchers
    const { data: existingVouchers } = await supabase
      .from("payment_vouchers")
      .select("beneficiary_id, amount")
      .eq("distribution_id", distributionId);

    // إذا كانت هناك سندات موجودة، استخدمها
    if (existingVouchers && existingVouchers.length > 0) {
      const beneficiaryIds = existingVouchers
        .map(v => v.beneficiary_id)
        .filter((id): id is string => id !== null);

      const { data: beneficiaries } = await supabase
        .from("beneficiaries")
        .select("id, full_name, iban, bank_name")
        .in("id", beneficiaryIds);

      return existingVouchers.map(voucher => {
        const beneficiary = beneficiaries?.find(b => b.id === voucher.beneficiary_id);
        return {
          beneficiary_id: voucher.beneficiary_id || '',
          beneficiary_name: beneficiary?.full_name || 'غير معروف',
          amount: voucher.amount,
          iban: beneficiary?.iban || undefined,
          bank_name: beneficiary?.bank_name || undefined,
        };
      });
    }

    // إذا لم توجد سندات، جلب المستفيدين النشطين وتوزيع المبلغ بالتساوي
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from("beneficiaries")
      .select("id, full_name, iban, bank_name, category")
      .in("status", ["نشط", "active"])
      .limit(100);

    if (beneficiariesError) throw beneficiariesError;
    if (!beneficiaries || beneficiaries.length === 0) {
      throw new Error("لا يوجد مستفيدين نشطين للتوزيع");
    }

    // توزيع المبلغ بالتساوي
    const totalAmount = distribution.total_amount || 0;
    const amountPerBeneficiary = Math.floor(totalAmount / beneficiaries.length);
    const remainder = totalAmount - (amountPerBeneficiary * beneficiaries.length);

    return beneficiaries.map((b, index) => ({
      beneficiary_id: b.id,
      beneficiary_name: b.full_name,
      amount: amountPerBeneficiary + (index === 0 ? remainder : 0), // إضافة الباقي للأول
      percentage: (amountPerBeneficiary / totalAmount) * 100,
      iban: b.iban || undefined,
      bank_name: b.bank_name || undefined,
    }));
  }

  /**
   * توليد سندات من توزيع مع دعم بنود التوزيع المتعددة
   */
  static async generateVouchersFromDistribution(distributionId: string) {
    try {
      // الحصول على بيانات التوزيع
      const { data: distribution, error: distError } = await supabase
        .from("distributions")
        .select("*")
        .eq("id", distributionId)
        .maybeSingle();

      if (distError) throw distError;
      if (!distribution) throw new Error("التوزيع غير موجود");

      // الحصول على بنود التوزيع
      const lines = await this.getDistributionLines(distributionId);

      if (lines.length === 0) {
        throw new Error("لا توجد بنود للتوزيع");
      }

      // إنشاء سند لكل مستفيد
      const createdVouchers = [];
      let successCount = 0;
      let failCount = 0;

      for (const line of lines) {
        try {
          const voucherData: VoucherData = {
            voucher_type: "payment",
            amount: line.amount,
            beneficiary_id: line.beneficiary_id,
            description: `توزيع بتاريخ ${distribution.distribution_date} - ${line.beneficiary_name}`,
            distribution_id: distributionId,
            payment_method: line.iban ? "bank_transfer" : "cash",
            notes: line.iban ? `IBAN: ${line.iban}` : undefined,
          };

          const result = await this.create(voucherData);
          createdVouchers.push(result.data);
          successCount++;
        } catch (error) {
          failCount++;
          logger.error(error, {
            context: "generate_voucher_for_beneficiary",
            severity: "medium",
            metadata: { beneficiary_id: line.beneficiary_id },
          });
        }
      }

      // تحديث حالة التوزيع
      await supabase
        .from("distributions")
        .update({ 
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", distributionId);

      await this.logActivity(
        `تم توليد ${successCount} سند من التوزيع بتاريخ ${distribution.distribution_date}${failCount > 0 ? ` (${failCount} فشل)` : ''}`
      );

      return {
        success: true,
        count: successCount,
        failedCount: failCount,
        vouchers: createdVouchers,
        totalAmount: lines.reduce((sum, l) => sum + l.amount, 0),
      };
    } catch (error) {
      logger.error(error, {
        context: "generate_vouchers_from_distribution",
        severity: "high",
      });
      throw error;
    }
  }

  /**
   * معاينة بنود التوزيع قبل التوليد
   */
  static async previewDistributionLines(distributionId: string): Promise<{
    lines: DistributionLineItem[];
    totalAmount: number;
    beneficiaryCount: number;
  }> {
    const lines = await this.getDistributionLines(distributionId);
    
    return {
      lines,
      totalAmount: lines.reduce((sum, l) => sum + l.amount, 0),
      beneficiaryCount: lines.length,
    };
  }

  /**
   * جلب السندات مع الفلترة
   */
  static async getWithFilters(searchTerm?: string, status?: string): Promise<VoucherWithDetails[]> {
    let query = supabase
      .from('payment_vouchers')
      .select(`
        *,
        beneficiaries (full_name, national_id),
        distributions (total_amount, distribution_date)
      `)
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.or(`voucher_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (status && status !== "all") {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VoucherWithDetails[];
  }
}
