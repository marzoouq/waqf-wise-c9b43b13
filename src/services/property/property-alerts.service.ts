/**
 * Property Alerts Service - خدمة تنبيهات العقارات
 * @description إدارة التنبيهات الذكية للعقارات
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Json } from '@/integrations/supabase/types';

export interface PropertyAlert {
  id: string;
  property_id: string | null;
  alert_type: string;
  title: string;
  message: string;
  severity: string;
  is_resolved: boolean;
  created_at: string;
}

export class PropertyAlertsService {
  /**
   * جلب تنبيهات العقار
   */
  static async getAlerts(propertyId?: string): Promise<PropertyAlert[]> {
    try {
      let query = supabase
        .from('property_alerts')
        .select('id, property_id, alert_type, title, message, severity, is_resolved, created_at')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching property alerts', error);
      return [];
    }
  }

  /**
   * حل تنبيه
   */
  static async resolveAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('property_alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error resolving property alert', error);
      throw error;
    }
  }

  /**
   * إنشاء تنبيه جديد
   */
  static async createAlert(alert: {
    property_id?: string;
    contract_id?: string;
    alert_type: string;
    severity?: string;
    title: string;
    message: string;
    action_url?: string;
    metadata?: Json;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('property_alerts')
        .insert([{
          property_id: alert.property_id || null,
          contract_id: alert.contract_id || null,
          alert_type: alert.alert_type,
          severity: alert.severity || 'medium',
          title: alert.title,
          message: alert.message,
          action_url: alert.action_url,
          metadata: alert.metadata || {}
        }]);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error creating property alert', error);
      throw error;
    }
  }

  /**
   * توليد التنبيهات الذكية
   */
  static async generateSmartAlerts(): Promise<{ success: boolean; alerts_generated: number }> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-smart-alerts', {
        body: { source: 'manual' }
      });

      if (error) throw error;
      return data || { success: true, alerts_generated: 0 };
    } catch (error) {
      productionLogger.error('Error generating smart alerts', error);
      throw error;
    }
  }
}
