import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PropertyStats {
  totalProperties: number;
  activeProperties: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalUnits: number;
  occupancyRate: number;
  totalMonthlyRevenue: number;
  totalAnnualRevenue: number;
  maintenanceRequests: number;
  expiringContracts: number;
  // للتوافق مع الكود السابق
  occupiedProperties: number;
  vacantProperties: number;
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

      // Get all property units for accurate occupancy calculation
      const { data: units, error: unitsError } = await supabase
        .from("property_units")
        .select("*");

      if (unitsError) throw unitsError;

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
      const activeProperties = properties?.filter(p => p.status === "مؤجر" || p.status === "active").length || 0;
      
      // حساب الإشغال من جدول الوحدات
      const totalUnits = units?.length || 0;
      const occupiedUnits = units?.filter(u => u.occupancy_status === 'مشغول').length || 0;
      const vacantUnits = totalUnits - occupiedUnits;
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

      // حساب الإيرادات من العقود النشطة
      const contractsRevenue = contracts?.reduce((sum, c) => sum + (Number(c.monthly_rent) || 0), 0) || 0;
      
      // أو من العقارات إذا لم تكن هناك عقود
      const propertiesRevenue = properties?.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0) || 0;
      
      const totalMonthlyRevenue = contractsRevenue > 0 ? contractsRevenue : propertiesRevenue;
      const totalAnnualRevenue = totalMonthlyRevenue * 12;

      return {
        totalProperties,
        activeProperties,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate,
        totalMonthlyRevenue,
        totalAnnualRevenue,
        maintenanceRequests: maintenance?.length || 0,
        expiringContracts: expiringContracts?.length || 0,
        // للتوافق مع الكود السابق
        occupiedProperties: contracts?.length || occupiedUnits,
        vacantProperties: totalProperties - (contracts?.length || 0),
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
