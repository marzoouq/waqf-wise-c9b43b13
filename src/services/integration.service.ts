/**
 * Integration Service - خدمة التكاملات
 * @version 2.8.28
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BankIntegrationRow = Database['public']['Tables']['bank_integrations']['Row'];
type PaymentGatewayRow = Database['public']['Tables']['payment_gateways']['Row'];
type GovernmentIntegrationRow = Database['public']['Tables']['government_integrations']['Row'];

export class IntegrationService {
  /**
   * جلب تكاملات البنوك
   */
  static async getBankIntegrations(): Promise<BankIntegrationRow[]> {
    const { data, error } = await supabase
      .from("bank_integrations")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب بوابات الدفع
   */
  static async getPaymentGateways(): Promise<PaymentGatewayRow[]> {
    const { data, error } = await supabase
      .from("payment_gateways")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب تكاملات حكومية
   */
  static async getGovernmentIntegrations(): Promise<GovernmentIntegrationRow[]> {
    const { data, error } = await supabase
      .from("government_integrations")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
}
