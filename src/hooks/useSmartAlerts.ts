import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { CACHE_TIMES } from "@/lib/queryOptimization";

export interface SmartAlert {
  id: string;
  type: 'contract_expiring' | 'rent_overdue' | 'loan_due' | 'request_overdue';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: Date;
  actionUrl: string;
}

export function useSmartAlerts() {
  return useQuery({
    queryKey: ["smart-alerts"],
    queryFn: async (): Promise<SmartAlert[]> => {
      try {
        const allAlerts: SmartAlert[] = [];
        const today = new Date();

        // 1. عقود قرب الانتهاء
        const { data: expiringContracts, error: contractsError } = await supabase
          .from('contracts')
          .select('id, contract_number, tenant_name, end_date, properties(name)')
          .eq('status', 'نشط')
          .gte('end_date', format(today, 'yyyy-MM-dd'))
          .lte('end_date', format(new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'))
          .limit(5);

        if (contractsError) throw contractsError;

        if (expiringContracts) {
          expiringContracts.forEach(contract => {
            const daysRemaining = differenceInDays(new Date(contract.end_date), today);
            allAlerts.push({
              id: contract.id,
              type: 'contract_expiring',
              title: `عقد ${contract.contract_number} قارب الانتهاء`,
              description: `عقد ${contract.tenant_name} - ${contract.properties?.name} ينتهي خلال ${daysRemaining} يوم`,
              severity: daysRemaining <= 30 ? 'high' : 'medium',
              date: new Date(contract.end_date),
              actionUrl: '/properties?tab=contracts'
            });
          });
        }

        // 2. إيجارات متأخرة
        const { data: overduePayments } = await supabase
          .from('rental_payments')
          .select(`
            id,
            payment_number,
            amount_due,
            due_date,
            contracts(tenant_name, properties(name))
          `)
          .eq('status', 'متأخر')
          .limit(5);

        if (overduePayments) {
          overduePayments.forEach(payment => {
            const daysOverdue = differenceInDays(today, new Date(payment.due_date));
            allAlerts.push({
              id: payment.id,
              type: 'rent_overdue',
              title: `دفعة إيجار متأخرة - ${payment.payment_number}`,
              description: `${payment.contracts?.tenant_name} - متأخر ${daysOverdue} يوم - ${payment.amount_due.toLocaleString('ar-SA')} ر.س`,
              severity: daysOverdue > 30 ? 'high' : 'medium',
              date: new Date(payment.due_date),
              actionUrl: '/properties?tab=payments'
            });
          });
        }

        // 3. قروض مستحقة قريبًا
        const { data: dueLoans } = await supabase
          .from('loan_installments')
          .select(`
            id,
            installment_number,
            principal_amount,
            due_date,
            loans(loan_number, beneficiaries(full_name))
          `)
          .eq('status', 'pending')
          .gte('due_date', format(today, 'yyyy-MM-dd'))
          .lte('due_date', format(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'))
          .limit(5);

        if (dueLoans) {
          dueLoans.forEach(installment => {
            const daysUntilDue = differenceInDays(new Date(installment.due_date), today);
            allAlerts.push({
              id: installment.id,
              type: 'loan_due',
              title: `قسط قرض مستحق قريبًا`,
              description: `قرض ${installment.loans?.loan_number} - ${installment.loans?.beneficiaries?.full_name} - ${daysUntilDue} يوم`,
              severity: daysUntilDue <= 7 ? 'high' : 'medium',
              date: new Date(installment.due_date),
              actionUrl: '/loans'
            });
          });
        }

        // 4. طلبات متأخرة
        const { data: overdueRequests } = await supabase
          .from('beneficiary_requests')
          .select(`
            id,
            request_number,
            sla_due_at,
            beneficiaries(full_name)
          `)
          .eq('is_overdue', true)
          .eq('status', 'قيد المراجعة')
          .limit(5);

        if (overdueRequests) {
          overdueRequests.forEach(request => {
            allAlerts.push({
              id: request.id,
              type: 'request_overdue',
              title: `طلب متأخر - ${request.request_number}`,
              description: `طلب ${request.beneficiaries?.full_name} تجاوز الوقت المحدد`,
              severity: 'high',
              date: new Date(request.sla_due_at || Date.now()),
              actionUrl: '/requests'
            });
          });
        }

        // ترتيب حسب الخطورة والتاريخ
        return allAlerts
          .sort((a, b) => {
            const severityOrder = { high: 3, medium: 2, low: 1 };
            if (severityOrder[a.severity] !== severityOrder[b.severity]) {
              return severityOrder[b.severity] - severityOrder[a.severity];
            }
            return a.date.getTime() - b.date.getTime();
          })
          .slice(0, 6);
      } catch (error) {
        console.error('Error fetching smart alerts:', error);
        throw error;
      }
    },
    staleTime: CACHE_TIMES.DYNAMIC,
    refetchInterval: 15000, // Refetch every 15 seconds
    retry: 2,
  });
}
