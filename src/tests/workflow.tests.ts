/**
 * اختبارات سير العمل (Workflow Tests)
 * اختبار تدفق العمليات كاملة
 */

import { supabase } from '@/integrations/supabase/client';

export interface WorkflowTestResult {
  id: string;
  name: string;
  category: string;
  success: boolean;
  duration: number;
  message?: string;
}

// ============= اختبارات سير العمل البسيطة =============

const workflowDefinitions = [
  { id: 'wf-beneficiary-list', name: 'عرض قائمة المستفيدين', category: 'المستفيدين', table: 'beneficiaries' },
  { id: 'wf-beneficiary-search', name: 'البحث في المستفيدين', category: 'المستفيدين', table: 'beneficiaries' },
  { id: 'wf-property-list', name: 'عرض العقارات', category: 'العقارات', table: 'properties' },
  { id: 'wf-units-list', name: 'عرض الوحدات', category: 'العقارات', table: 'property_units' },
  { id: 'wf-tenant-list', name: 'عرض المستأجرين', category: 'العقارات', table: 'tenants' },
  { id: 'wf-contract-list', name: 'عرض العقود', category: 'العقارات', table: 'contracts' },
  { id: 'wf-payment-list', name: 'عرض المدفوعات', category: 'المالية', table: 'payments' },
  { id: 'wf-invoice-list', name: 'عرض الفواتير', category: 'المالية', table: 'invoices' },
  { id: 'wf-journal-list', name: 'عرض القيود', category: 'المالية', table: 'journal_entries' },
  { id: 'wf-distribution-list', name: 'عرض التوزيعات', category: 'المالية', table: 'distributions' },
  { id: 'wf-governance-list', name: 'عرض القرارات', category: 'الحوكمة', table: 'governance_decisions' },
  { id: 'wf-approval-list', name: 'عرض الموافقات', category: 'الحوكمة', table: 'approval_status' },
  { id: 'wf-disclosure-list', name: 'عرض الإفصاحات', category: 'الحوكمة', table: 'annual_disclosures' },
  { id: 'wf-support-list', name: 'عرض تذاكر الدعم', category: 'الدعم', table: 'support_tickets' },
  { id: 'wf-notification-list', name: 'عرض الإشعارات', category: 'الدعم', table: 'notifications' },
];

export async function runWorkflowTests(): Promise<WorkflowTestResult[]> {
  const results: WorkflowTestResult[] = [];
  
  for (const wf of workflowDefinitions) {
    const start = performance.now();
    try {
      const { error } = await supabase.from(wf.table).select('id').limit(5);
      results.push({
        id: wf.id,
        name: wf.name,
        category: wf.category,
        success: error === null,
        duration: Math.round(performance.now() - start),
        message: error ? error.message : 'نجح'
      });
    } catch (err) {
      results.push({
        id: wf.id,
        name: wf.name,
        category: wf.category,
        success: false,
        duration: Math.round(performance.now() - start),
        message: err instanceof Error ? err.message : 'خطأ'
      });
    }
  }
  
  return results;
}
