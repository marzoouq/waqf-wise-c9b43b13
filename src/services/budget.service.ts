import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

/**
 * خدمة إدارة الميزانيات
 * توليد ميزانيات تلقائية وحساب الفروقات
 */
export class BudgetService {
  /**
   * توليد ميزانية من السنة السابقة
   */
  static async generateFromPreviousYear(
    fiscalYearId: string, 
    increasePercentage: number = 0
  ) {
    try {
      // استدعاء الدالة من قاعدة البيانات
      const { data, error } = await supabase.rpc(
        'generate_budget_from_previous_year',
        {
          p_fiscal_year_id: fiscalYearId,
          p_increase_percentage: increasePercentage
        }
      );

      if (error) throw error;

      await this.logActivity(
        `تم توليد ${data} بند ميزانية من السنة السابقة بزيادة ${increasePercentage}%`
      );

      return {
        success: true,
        recordsCreated: data,
      };
    } catch (error) {
      logger.error(error, {
        context: "generate_budget_from_previous",
        severity: "high",
      });
      throw error;
    }
  }

  /**
   * حساب الفروقات للميزانية
   */
  static async calculateVariances(fiscalYearId: string) {
    try {
      // الحصول على جميع الميزانيات للسنة المالية
      const { data: budgets, error: budgetsError } = await supabase
        .from("budgets")
        .select("id, account_id, budgeted_amount")
        .eq("fiscal_year_id", fiscalYearId);

      if (budgetsError) throw budgetsError;

      let updatedCount = 0;

      for (const budget of budgets || []) {
        // حساب المبلغ الفعلي من القيود المحاسبية
        const { data: entries } = await supabase
          .from("journal_entry_lines")
          .select("debit_amount, credit_amount, journal_entries!inner(fiscal_year_id)")
          .eq("account_id", budget.account_id)
          .eq("journal_entries.fiscal_year_id", fiscalYearId);

        let actualAmount = 0;
        for (const entry of entries || []) {
          actualAmount += (entry.debit_amount || 0) - (entry.credit_amount || 0);
        }

        const varianceAmount = budget.budgeted_amount - actualAmount;

        // تحديث الميزانية
        const { error: updateError } = await supabase
          .from("budgets")
          .update({
            actual_amount: actualAmount,
            variance_amount: varianceAmount,
          })
          .eq("id", budget.id);

        if (!updateError) {
          updatedCount++;
        }
      }

      await this.logActivity(
        `تم حساب الفروقات لـ ${updatedCount} بند ميزانية`
      );

      return {
        success: true,
        updatedCount,
      };
    } catch (error) {
      logger.error(error, {
        context: "calculate_budget_variances",
        severity: "medium",
      });
      throw error;
    }
  }

  /**
   * إنشاء ميزانية جديدة
   */
  static async create(budgetData: {
    fiscal_year_id: string;
    account_id: string;
    period_type: string;
    period_number?: number;
    budgeted_amount: number;
  }) {
    try {
      const { data: budget, error } = await supabase
        .from("budgets")
        .insert([budgetData])
        .select()
        .single();

      if (error) throw error;

      await this.logActivity(
        `تم إنشاء بند ميزانية بمبلغ ${budgetData.budgeted_amount} ريال`
      );

      return {
        success: true,
        data: budget,
      };
    } catch (error) {
      logger.error(error, {
        context: "create_budget",
        severity: "high",
      });
      throw error;
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
        context: "log_budget_activity",
        severity: "low",
      });
    }
  }
}
