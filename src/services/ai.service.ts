/**
 * AI Service - خدمة الذكاء الاصطناعي
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  alert_type: string;
  severity: string;
  data: Json;
  created_at: string;
  is_dismissed: boolean;
}

export class AIService {
  /**
   * جلب الرؤى الذكية
   */
  static async getInsights(): Promise<AIInsight[]> {
    const { data, error } = await supabase
      .from('smart_alerts')
      .select('id, title, description, alert_type, severity, data, created_at, is_dismissed')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  /**
   * توليد رؤى جديدة
   */
  static async generateInsights(reportType: 'beneficiaries' | 'properties' | 'financial' | 'loans') {
    const { data, error } = await supabase.functions.invoke('generate-ai-insights', {
      body: { reportType },
    });

    if (error) throw error;
    return data;
  }

  /**
   * إخفاء رؤية
   */
  static async dismissInsight(insightId: string): Promise<void> {
    const { error } = await supabase
      .from('smart_alerts')
      .update({ is_dismissed: true })
      .eq('id', insightId);

    if (error) throw error;
  }
}
