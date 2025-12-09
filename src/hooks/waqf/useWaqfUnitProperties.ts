/**
 * Hook لجلب عقارات قلم الوقف
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ContractInfo {
  monthly_rent: number;
  payment_frequency: string;
  status: string;
}

interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  units: number;
  occupied: number;
  monthly_revenue: number;
  status: string;
  contracts?: ContractInfo[];
}

export function useWaqfUnitProperties(waqfUnitId: string | undefined, isOpen: boolean) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && waqfUnitId) {
      fetchProperties();
    }
  }, [isOpen, waqfUnitId]);

  const fetchProperties = async () => {
    if (!waqfUnitId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id, name, type, location, units, occupied, monthly_revenue, status,
          contracts!contracts_property_id_fkey(
            monthly_rent, 
            payment_frequency, 
            status
          )
        `)
        .eq("waqf_unit_id", waqfUnitId);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchProperties();
  };

  return {
    properties,
    isLoading,
    refetch,
  };
}
