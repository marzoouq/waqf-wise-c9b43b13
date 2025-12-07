import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { logger } from "@/lib/logger";

export interface PendingApproval {
  id: string;
  type: 'distribution' | 'request' | 'journal' | 'payment';
  title: string;
  amount?: number;
  date: Date;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ["pending-approvals"],
    queryFn: async (): Promise<PendingApproval[]> => {
      try {
        const allApprovals: PendingApproval[] = [];

        // تنفيذ جميع الاستعلامات بشكل متوازي
        const [distApprovalsResult, reqApprovalsResult, journalApprovalsResult] = await Promise.all([
          supabase
            .from('distribution_approvals')
            .select(`
              id,
              created_at,
              distributions(
                month,
                total_amount,
                beneficiaries_count
              )
            `)
            .eq('status', 'معلق')
            .eq('level', 3)
            .limit(5),
          supabase
            .from('request_approvals')
            .select(`
              id,
              created_at,
              beneficiary_requests(
                request_number,
                amount,
                priority,
                beneficiaries(full_name)
              )
            `)
            .eq('status', 'معلق')
            .eq('level', 3)
            .limit(5),
          supabase
            .from('approvals')
            .select(`
              id,
              created_at,
              journal_entries(
                entry_number,
                description
              )
            `)
            .eq('status', 'pending')
            .limit(5)
        ]);

        // معالجة الأخطاء
        if (distApprovalsResult.error) throw distApprovalsResult.error;
        if (reqApprovalsResult.error) throw reqApprovalsResult.error;
        if (journalApprovalsResult.error) throw journalApprovalsResult.error;

        // معالجة موافقات التوزيعات
        if (distApprovalsResult.data) {
          distApprovalsResult.data.forEach(app => {
            if (app.distributions) {
              allApprovals.push({
                id: app.id,
                type: 'distribution',
                title: `توزيع ${app.distributions.month}`,
                amount: app.distributions.total_amount,
                date: new Date(app.created_at),
                priority: 'high',
                description: `توزيع لـ ${app.distributions.beneficiaries_count} مستفيد`
              });
            }
          });
        }

        // معالجة موافقات الطلبات
        if (reqApprovalsResult.data) {
          reqApprovalsResult.data.forEach(app => {
            if (app.beneficiary_requests && app.beneficiary_requests.beneficiaries) {
              allApprovals.push({
                id: app.id,
                type: 'request',
                title: `طلب ${app.beneficiary_requests.request_number || ''}`,
                amount: app.beneficiary_requests.amount,
                date: new Date(app.created_at),
                priority: app.beneficiary_requests.priority === 'عاجلة' ? 'high' : 'medium',
                description: `من ${app.beneficiary_requests.beneficiaries.full_name}`
              });
            }
          });
        }

        // معالجة موافقات القيود المحاسبية
        if (journalApprovalsResult.data) {
          journalApprovalsResult.data.forEach(app => {
            if (app.journal_entries) {
              allApprovals.push({
                id: app.id,
                type: 'journal',
                title: `قيد ${app.journal_entries.entry_number}`,
                date: new Date(app.created_at),
                priority: 'medium',
                description: app.journal_entries.description
              });
            }
          });
        }

        // ترتيب حسب الأولوية والتاريخ
        return allApprovals
          .sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
              return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return b.date.getTime() - a.date.getTime();
          })
          .slice(0, 6);
      } catch (error) {
        logger.error(error, { context: 'fetch_pending_approvals', severity: 'medium' });
        throw error;
      }
    },
    ...QUERY_CONFIG.APPROVALS,
  });
}
