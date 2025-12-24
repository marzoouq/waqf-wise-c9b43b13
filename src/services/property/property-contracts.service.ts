/**
 * Property Contracts Service - خدمة عقود العقارات
 * @description إدارة العقود والمدفوعات المتعلقة بالعقارات
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

export class PropertyContractsService {
  /**
   * جلب العقود للعقار
   */
  static async getContracts(propertyId: string): Promise<Database['public']['Tables']['contracts']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('property_id', propertyId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching property contracts', error);
      throw error;
    }
  }

  /**
   * جلب مدفوعات العقد
   */
  static async getPayments(contractId: string): Promise<Database['public']['Tables']['rental_payments']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('rental_payments')
        .select('*')
        .eq('contract_id', contractId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching contract payments', error);
      throw error;
    }
  }

  /**
   * جلب المدفوعات مع نوع الدفع من العقود
   */
  static async getRentalPaymentsWithFrequency(): Promise<{
    amount_paid: number | null;
    tax_amount: number | null;
    contracts: {
      payment_frequency: string | null;
    } | null;
  }[]> {
    try {
      const { data, error } = await supabase
        .from("rental_payments")
        .select(`
          amount_paid,
          tax_amount,
          contracts!inner (
            payment_frequency
          )
        `)
        .eq("status", "مدفوع");

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching rental payments with frequency', error);
      throw error;
    }
  }
}
