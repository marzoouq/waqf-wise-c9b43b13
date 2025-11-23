import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PropertyStats {
  totalProperties: number;
  activeProperties: number;
  occupiedProperties: number;
  vacantProperties: number;
  totalMonthlyRevenue: number;
  totalAnnualRevenue: number;
  maintenanceRequests: number;
  expiringContracts: number;
}

export function usePropertiesStats() {
  return useQuery({
    queryKey: ["properties-stats"],
    queryFn: async (): Promise<PropertyStats> => {
      // Get all properties
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select("*");

      if (propertiesError) throw propertiesError;

      // Get active contracts
      const { data: contracts, error: contractsError } = await supabase
        .from("contracts")
        .select("*")
        .eq("status", "نشط");

      if (contractsError) throw contractsError;

      // Get maintenance requests
      const { data: maintenance, error: maintenanceError } = await supabase
        .from("maintenance_requests")
        .select("*")
        .in("status", ["معلق", "قيد التنفيذ"]);

      if (maintenanceError) throw maintenanceError;

      // Get expiring contracts (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: expiringContracts, error: expiringError } = await supabase
        .from("contracts")
        .select("*")
        .eq("status", "نشط")
        .lte("end_date", thirtyDaysFromNow.toISOString().split('T')[0]);

      if (expiringError) throw expiringError;

      const totalProperties = properties?.length || 0;
      const activeProperties = properties?.filter(p => p.status === "مؤجر").length || 0;
      const occupiedProperties = contracts?.length || 0;
      const vacantProperties = totalProperties - occupiedProperties;
      
      const totalMonthlyRevenue = properties?.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0) || 0;
      const totalAnnualRevenue = totalMonthlyRevenue * 12;

      return {
        totalProperties,
        activeProperties,
        occupiedProperties,
        vacantProperties,
        totalMonthlyRevenue,
        totalAnnualRevenue,
        maintenanceRequests: maintenance?.length || 0,
        expiringContracts: expiringContracts?.length || 0,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
