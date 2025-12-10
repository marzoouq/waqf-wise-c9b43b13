/**
 * Hook لربط العقارات بأقلام الوقف
 * @version 2.8.67
 */

import { useState, useEffect } from "react";
import { PropertyService } from "@/services";
import { toast } from "sonner";

interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  waqf_unit_id: string | null;
}

export function useLinkProperty(isOpen: boolean) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUnlinkedProperties();
    }
  }, [isOpen]);

  const fetchUnlinkedProperties = async () => {
    setIsLoading(true);
    try {
      const data = await PropertyService.getUnlinkedToWaqf();
      setProperties(data as Property[]);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("فشل في جلب العقارات");
    } finally {
      setIsLoading(false);
    }
  };

  const linkProperty = async (waqfUnitId: string, onSuccess?: () => void) => {
    if (!selectedPropertyId) {
      toast.error("الرجاء اختيار عقار");
      return false;
    }

    setIsSaving(true);
    try {
      await PropertyService.linkToWaqfUnit(selectedPropertyId, waqfUnitId);
      toast.success("تم ربط العقار بنجاح");
      setSelectedPropertyId("");
      onSuccess?.();
      return true;
    } catch (error) {
      console.error("Error linking property:", error);
      toast.error("فشل في ربط العقار");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    properties,
    selectedPropertyId,
    setSelectedPropertyId,
    isLoading,
    isSaving,
    linkProperty,
  };
}
