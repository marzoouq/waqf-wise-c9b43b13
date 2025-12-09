/**
 * Hook لربط العقارات بأقلام الوقف
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, location, type, waqf_unit_id")
        .is("waqf_unit_id", null);

      if (error) throw error;
      setProperties(data || []);
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
      const { error } = await supabase
        .from("properties")
        .update({ waqf_unit_id: waqfUnitId })
        .eq("id", selectedPropertyId);

      if (error) throw error;

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
