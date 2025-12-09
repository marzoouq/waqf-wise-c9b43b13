/**
 * Reports Service - خدمة التقارير
 * @version 2.8.44
 */

import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";
import type { PropertyRow, ContractRow } from "@/types/supabase-helpers";

export interface CashFlowData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface PropertyWithContracts extends PropertyRow {
  contracts?: ContractRow[];
}

export interface OperationRecord {
  id: string;
  type: string;
  number: string;
  description: string;
  amount: number;
  date: string;
  journalEntry?: string;
  journalEntryId?: string | null;
  reason?: string;
}

export class ReportsService {
  /**
   * جلب بيانات التدفقات النقدية
   */
  static async getCashFlowData(): Promise<CashFlowData[]> {
    try {
      const { data, error } = await supabase
        .from("unified_transactions_view")
        .select("transaction_date, amount, transaction_type")
        .gte("transaction_date", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // تجميع البيانات حسب الشهر
      const monthlyData: Record<string, { income: number; expense: number }> = {};

      (data || []).forEach((transaction) => {
        const month = new Date(transaction.transaction_date).toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "short",
        });

        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expense: 0 };
        }

        if (transaction.transaction_type === "قبض") {
          monthlyData[month].income += transaction.amount;
        } else {
          monthlyData[month].expense += transaction.amount;
        }
      });

      const chartData: CashFlowData[] = Object.entries(monthlyData).map(([month, d]) => ({
        month,
        income: d.income,
        expense: d.expense,
        net: d.income - d.expense,
      }));

      return chartData.sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
    } catch (error) {
      productionLogger.error("Error fetching cash flow data", error);
      throw error;
    }
  }

  /**
   * جلب تقرير العقارات
   */
  static async getPropertiesReport(): Promise<PropertyWithContracts[]> {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          contracts (
            id,
            contract_number,
            tenant_name,
            monthly_rent,
            status
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PropertyWithContracts[];
    } catch (error) {
      productionLogger.error("Error fetching properties report", error);
      throw error;
    }
  }

  /**
   * جلب العمليات المرتبطة محاسبياً
   */
  static async getLinkedOperations(): Promise<OperationRecord[]> {
    try {
      const operations: OperationRecord[] = [];

      const { data: payments } = await supabase
        .from("payments")
        .select("*, journal_entries:journal_entry_id(*)")
        .not("journal_entry_id", "is", null);
      
      if (payments) {
        operations.push(...payments.map(p => ({
          id: p.id,
          type: "سند",
          number: p.payment_number,
          description: p.description || '',
          amount: p.amount,
          date: p.payment_date,
          journalEntry: p.journal_entries?.entry_number,
          journalEntryId: p.journal_entry_id,
        })));
      }

      const { data: rentals } = await supabase
        .from("rental_payments")
        .select("*, journal_entries:journal_entry_id(*), contracts(contract_number)")
        .not("journal_entry_id", "is", null);
      
      if (rentals) {
        operations.push(...rentals.map(r => ({
          id: r.id,
          type: "إيجار",
          number: r.payment_number,
          description: `دفعة إيجار - عقد ${r.contracts?.contract_number || ''}`,
          amount: r.amount_paid,
          date: r.payment_date,
          journalEntry: r.journal_entries?.entry_number,
          journalEntryId: r.journal_entry_id,
        })));
      }

      const { data: invoices } = await supabase
        .from("invoices")
        .select("*, journal_entries:journal_entry_id(*)")
        .not("journal_entry_id", "is", null);
      
      if (invoices) {
        operations.push(...invoices.map(i => ({
          id: i.id,
          type: "فاتورة",
          number: i.invoice_number,
          description: `فاتورة - ${i.customer_name}`,
          amount: i.total_amount,
          date: i.invoice_date,
          journalEntry: i.journal_entries?.entry_number,
          journalEntryId: i.journal_entry_id,
        })));
      }

      const { data: distributions } = await supabase
        .from("distributions")
        .select("*, journal_entries:journal_entry_id(*)")
        .not("journal_entry_id", "is", null);
      
      if (distributions) {
        operations.push(...distributions.map(d => ({
          id: d.id,
          type: "توزيع",
          number: d.month,
          description: `توزيع ${d.month}`,
          amount: d.total_amount,
          date: d.distribution_date,
          journalEntry: d.journal_entries?.entry_number,
          journalEntryId: d.journal_entry_id,
        })));
      }

      const { data: maintenance } = await supabase
        .from("maintenance_requests")
        .select("*, journal_entries:journal_entry_id(*)")
        .not("journal_entry_id", "is", null);
      
      if (maintenance) {
        operations.push(...maintenance.map(m => ({
          id: m.id,
          type: "صيانة",
          number: m.title || m.id.substring(0, 8),
          description: m.description || m.title || '',
          amount: m.actual_cost || 0,
          date: m.completed_date || new Date().toISOString(),
          journalEntry: m.journal_entries?.entry_number,
          journalEntryId: m.journal_entry_id,
        })));
      }

      return operations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      productionLogger.error("Error fetching linked operations", error);
      throw error;
    }
  }

  /**
   * جلب العمليات غير المرتبطة محاسبياً
   */
  static async getUnlinkedOperations(): Promise<OperationRecord[]> {
    try {
      const operations: OperationRecord[] = [];

      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .is("journal_entry_id", null)
        .gte("amount", 0);
      
      if (payments) {
        operations.push(...payments.map(p => ({
          id: p.id,
          type: "سند",
          number: p.payment_number,
          description: p.description || '',
          amount: p.amount,
          date: p.payment_date,
          reason: "لم يتم إنشاء قيد محاسبي تلقائياً",
        })));
      }

      return operations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      productionLogger.error("Error fetching unlinked operations", error);
      throw error;
    }
  }
}
