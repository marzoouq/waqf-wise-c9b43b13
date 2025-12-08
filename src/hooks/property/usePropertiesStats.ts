/**
 * usePropertiesStats Hook
 * Hook لجلب إحصائيات العقارات - يستخدم Service Layer
 */

import { useQuery } from "@tanstack/react-query";
import { PropertyService } from "@/services";

export interface PropertyStats {
  totalProperties: number;
  activeProperties: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalUnits: number;
  occupancyRate: number;
  totalCollected: number;
  annualCollected: number;
  monthlyCollected: number;
  totalTax: number;
  totalNetRevenue: number;
  fiscalYearName: string;
  carryForwardWaqfCorpus: number;
  carryForwardSourceYear: string;
  maintenanceRequests: number;
  expiringContracts: number;
  occupiedProperties: number;
  vacantProperties: number;
  totalMonthlyRevenue: number;
  totalAnnualRevenue: number;
}

export function usePropertiesStats() {
  return useQuery({
    queryKey: ["properties-stats"],
    queryFn: (): Promise<PropertyStats> => PropertyService.getPropertiesStats(),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
