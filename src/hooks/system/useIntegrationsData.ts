/**
 * Hook for IntegrationsManagement data fetching
 * يجلب بيانات التكاملات الخارجية
 */

import { useQuery } from "@tanstack/react-query";
import { IntegrationService } from "@/services";

export function useIntegrationsData() {
  const {
    data: bankIntegrations = [],
    isLoading: bankLoading,
  } = useQuery({
    queryKey: ["bank-integrations"],
    queryFn: () => IntegrationService.getBankIntegrations(),
  });

  const {
    data: paymentGateways = [],
    isLoading: gatewaysLoading,
  } = useQuery({
    queryKey: ["payment-gateways"],
    queryFn: () => IntegrationService.getPaymentGateways(),
  });

  const {
    data: governmentIntegrations = [],
    isLoading: governmentLoading,
  } = useQuery({
    queryKey: ["government-integrations"],
    queryFn: () => IntegrationService.getGovernmentIntegrations(),
  });

  return {
    bankIntegrations,
    paymentGateways,
    governmentIntegrations,
    isLoading: bankLoading || gatewaysLoading || governmentLoading,
  };
}
