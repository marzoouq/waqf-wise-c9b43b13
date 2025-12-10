/**
 * Hook لجلب عقارات قلم الوقف
 * @version 2.8.65
 */

import { useState, useEffect } from "react";
import { PropertyService } from "@/services";
import { productionLogger } from "@/lib/logger/production-logger";

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
      const allProperties = await PropertyService.getAll();
      const filteredProperties = allProperties.filter(p => p.waqf_unit_id === waqfUnitId);
      setProperties(filteredProperties as unknown as Property[]);
    } catch (error) {
      productionLogger.error("Error fetching properties:", error);
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
