/**
 * Accounting Link Report Hook
 * @version 2.8.40
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  PaymentRow, 
  JournalEntryRow, 
  InvoiceRow, 
  DistributionRow,
  ContractRow 
} from "@/types/supabase-helpers";

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

interface PaymentWithJournal extends PaymentRow {
  journal_entries?: JournalEntryRow;
}

interface RentalPaymentWithRelations {
  id: string;
  payment_number: string;
  amount_paid: number;
  payment_date: string;
  journal_entry_id: string | null;
  journal_entries?: JournalEntryRow;
  contracts?: Pick<ContractRow, 'contract_number'>;
}

interface InvoiceWithJournal extends InvoiceRow {
  journal_entries?: JournalEntryRow;
}

interface DistributionWithJournal extends DistributionRow {
  journal_entries?: JournalEntryRow;
}

interface MaintenanceRequestWithJournal {
  id: string;
  title?: string;
  description?: string;
  actual_cost?: number;
  completed_date?: string;
  journal_entry_id: string | null;
  journal_entries?: JournalEntryRow;
}

export function useAccountingLinkReport() {
  const linkedQuery = useQuery<OperationRecord[]>({
    queryKey: ["accounting-link", "linked"],
    queryFn: async () => {
      const operations: OperationRecord[] = [];

      const { data: payments } = await supabase
        .from("payments")
        .select("*, journal_entries:journal_entry_id(*)")
        .not("journal_entry_id", "is", null);
      
      if (payments) {
        operations.push(...(payments as PaymentWithJournal[]).map(p => ({
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
        operations.push(...(rentals as RentalPaymentWithRelations[]).map(r => ({
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
        operations.push(...(invoices as InvoiceWithJournal[]).map(i => ({
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
        operations.push(...(distributions as DistributionWithJournal[]).map(d => ({
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
        operations.push(...(maintenance as MaintenanceRequestWithJournal[]).map(m => ({
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
    },
  });

  const unlinkedQuery = useQuery<OperationRecord[]>({
    queryKey: ["accounting-link", "unlinked"],
    queryFn: async () => {
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
    },
  });

  return {
    linkedOperations: linkedQuery.data || [],
    unlinkedOperations: unlinkedQuery.data || [],
    isLoadingLinked: linkedQuery.isLoading,
    isLoadingUnlinked: unlinkedQuery.isLoading,
  };
}
