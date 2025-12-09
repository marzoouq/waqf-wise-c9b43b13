/**
 * useMaintenanceCostReport Hook
 * Hook لتقرير تكاليف الصيانة
 * @version 2.8.54
 */
import { useQuery } from '@tanstack/react-query';
import { MaintenanceService } from '@/services/maintenance.service';
import { QUERY_KEYS } from '@/lib/query-keys';

export interface MaintenanceCostData {
  property_id: string;
  property_name: string;
  total_cost: number;
  completed_count: number;
  pending_count: number;
  avg_cost: number;
}

export interface MaintenanceTypeData {
  name: string;
  value: number;
  count: number;
}

export function useMaintenanceCostReport() {
  const { data: maintenanceData, isLoading, error } = useQuery<MaintenanceCostData[]>({
    queryKey: QUERY_KEYS.MAINTENANCE_COST_ANALYSIS,
    queryFn: () => MaintenanceService.getCostAnalysis(),
  });

  const { data: typeAnalysis } = useQuery<MaintenanceTypeData[]>({
    queryKey: QUERY_KEYS.MAINTENANCE_TYPE_ANALYSIS,
    queryFn: () => MaintenanceService.getTypeAnalysis(),
  });

  const totals = maintenanceData ? {
    totalCost: maintenanceData.reduce((sum, m) => sum + m.total_cost, 0),
    totalCompleted: maintenanceData.reduce((sum, m) => sum + m.completed_count, 0),
    totalPending: maintenanceData.reduce((sum, m) => sum + m.pending_count, 0),
  } : { totalCost: 0, totalCompleted: 0, totalPending: 0 };

  return {
    maintenanceData,
    typeAnalysis,
    totals,
    isLoading,
    error,
  };
}
