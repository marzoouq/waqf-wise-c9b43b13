/**
 * Hook for IntegrationsManagement data fetching
 * يجلب بيانات التكاملات الخارجية
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BankIntegration, PaymentGateway, GovernmentIntegration } from "@/types/integrations";

export function useIntegrationsData() {
  const {
    data: bankIntegrations = [],
    isLoading: bankLoading,
  } = useQuery({
    queryKey: ["bank-integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_integrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BankIntegration[];
    },
  });

  const {
    data: paymentGateways = [],
    isLoading: gatewaysLoading,
  } = useQuery({
    queryKey: ["payment-gateways"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_gateways")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PaymentGateway[];
    },
  });

  const {
    data: governmentIntegrations = [],
    isLoading: governmentLoading,
  } = useQuery({
    queryKey: ["government-integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("government_integrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as GovernmentIntegration[];
    },
  });

  return {
    bankIntegrations,
    paymentGateways,
    governmentIntegrations,
    isLoading: bankLoading || gatewaysLoading || governmentLoading,
  };
}
