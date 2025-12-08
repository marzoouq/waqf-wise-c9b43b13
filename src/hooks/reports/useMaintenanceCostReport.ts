/**
 * useMaintenanceCostReport Hook
 * Hook لتقرير تكاليف الصيانة
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    queryKey: ['maintenance-cost-analysis'],
    queryFn: async () => {
      const { data: requests, error } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          estimated_cost,
          actual_cost,
          status,
          properties!inner(id, name)
        `);
      
      if (error) throw error;

      // تجميع البيانات حسب العقار
      const propertyData: Record<string, MaintenanceCostData> = {};
      
      (requests || []).forEach((req) => {
        const property = req.properties as unknown as { id: string; name: string };
        const propertyId = property.id;
        const propertyName = property.name;
        
        if (!propertyData[propertyId]) {
          propertyData[propertyId] = {
            property_id: propertyId,
            property_name: propertyName,
            total_cost: 0,
            completed_count: 0,
            pending_count: 0,
            avg_cost: 0
          };
        }

        const cost = Number(req.actual_cost || req.estimated_cost || 0);
        propertyData[propertyId].total_cost += cost;
        if (req.status === 'مكتمل') {
          propertyData[propertyId].completed_count += 1;
        } else if (req.status === 'معلق') {
          propertyData[propertyId].pending_count += 1;
        }
      });

      // حساب المتوسط
      return Object.values(propertyData)
        .map(item => ({
          ...item,
          avg_cost: item.completed_count > 0 ? item.total_cost / item.completed_count : 0
        }))
        .sort((a, b) => b.total_cost - a.total_cost);
    },
  });

  const { data: typeAnalysis } = useQuery<MaintenanceTypeData[]>({
    queryKey: ['maintenance-type-analysis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('category, estimated_cost, actual_cost, status');
      
      if (error) throw error;

      const typeData = (data || []).reduce((acc, req) => {
        const category = req.category || 'غير محدد';
        if (!acc[category]) {
          acc[category] = { name: category, value: 0, count: 0 };
        }
        const cost = Number(req.actual_cost || req.estimated_cost || 0);
        acc[category].value += cost;
        acc[category].count += 1;
        return acc;
      }, {} as Record<string, MaintenanceTypeData>);

      return Object.values(typeData);
    },
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
