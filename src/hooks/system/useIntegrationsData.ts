/**
 * Hook for IntegrationsManagement data fetching
 * يجلب بيانات التكاملات الخارجية
 */

import { useQuery } from "@tanstack/react-query";
import { IntegrationService } from "@/services";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

export function useIntegrationsData() {
  const {
    data: bankIntegrations = [],
    isLoading: bankLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.BANK_INTEGRATIONS,
    queryFn: () => IntegrationService.getBankIntegrations(),
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });

  const {
    data: paymentGateways = [],
    isLoading: gatewaysLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.PAYMENT_GATEWAYS,
    queryFn: () => IntegrationService.getPaymentGateways(),
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });

  const {
    data: governmentIntegrations = [],
    isLoading: governmentLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.GOVERNMENT_INTEGRATIONS,
    queryFn: () => IntegrationService.getGovernmentIntegrations(),
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });

  return {
    bankIntegrations,
    paymentGateways,
    governmentIntegrations,
    isLoading: bankLoading || gatewaysLoading || governmentLoading,
  };
}
