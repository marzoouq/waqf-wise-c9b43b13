/**
 * Distribution Approval Service - خدمة موافقات التوزيع
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';

export interface DistributionApproval {
  id: string;
  distribution_id: string;
  level: number;
  status: string;
  approver_name: string;
  notes: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface ApprovalHistoryItem {
  id: string;
  action: string;
  notes: string | null;
  performed_by_name: string | null;
  created_at: string;
}

export class DistributionApprovalService {
  /**
   * جلب موافقات التوزيع
   */
  static async getDistributionApprovals(distributionId: string): Promise<DistributionApproval[]> {
    try {
      const { data, error } = await supabase
        .from('distribution_approvals')
        .select('id, distribution_id, level, status, approver_name, notes, approved_at, created_at')
        .eq('distribution_id', distributionId)
        .order('level', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching distribution approvals', error);
      throw error;
    }
  }

  /**
   * جلب سجل موافقات التوزيع
   */
  static async getDistributionHistory(distributionId: string): Promise<ApprovalHistoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('approval_history')
        .select('id, action, notes, performed_by_name, created_at')
        .eq('reference_id', distributionId)
        .eq('approval_type', 'distribution')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching distribution history', error);
      throw error;
    }
  }

  /**
   * جلب الجدول الزمني للتوزيع
   */
  static async getTimeline(distributionId: string, distribution: {
    created_at: string;
    approved_at: string | null;
    approved_by: string | null;
    status: string;
    updated_at: string;
  }): Promise<{ events: { date: string; action: string; user?: string; notes?: string }[] }> {
    const events: { date: string; action: string; user?: string; notes?: string }[] = [];

    events.push({
      date: distribution.created_at,
      action: 'إنشاء التوزيع',
    });

    if (distribution.approved_at) {
      events.push({
        date: distribution.approved_at,
        action: 'الموافقة على التوزيع',
        user: distribution.approved_by || undefined,
      });
    }

    if (distribution.status === 'paid') {
      events.push({
        date: distribution.updated_at,
        action: 'تم الصرف',
      });
    }

    return { events };
  }
}
