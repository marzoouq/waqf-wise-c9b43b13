/**
 * Hook للمساعد الذكي للعقارات
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";
import { toast } from "sonner";
import type { SystemAlert } from "@/types/alerts";

interface PropertyData {
  id?: string;
  name?: string;
  type?: string;
  location?: string;
  area?: number;
  monthly_rent?: number;
  annual_rent?: number;
  occupancy_rate?: number;
  maintenance_cost?: number;
  contracts?: Array<{
    id: string;
    tenant_name?: string;
    start_date?: string;
    end_date?: string;
    monthly_rent?: number;
  }>;
  maintenance_history?: Array<{
    date: string;
    description: string;
    cost: number;
  }>;
  alerts?: SystemAlert[];
}

type ActionType = "analyze_property" | "suggest_maintenance" | "predict_revenue" | "optimize_contracts" | "alert_insights";

export function usePropertyAIAssistant() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");

  const analyze = async (actionType: ActionType, propertyData?: PropertyData) => {
    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const { data, error } = await supabase.functions.invoke('property-ai-assistant', {
        body: {
          action: actionType,
          data: propertyData
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return null;
      }

      setAnalysis(data.analysis);
      toast.success("تم التحليل بنجاح!");
      return data.analysis;
    } catch (error) {
      productionLogger.error("AI Analysis Error:", error);
      toast.error("حدث خطأ أثناء التحليل");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAnalysis("");
  };

  return {
    isAnalyzing,
    analysis,
    analyze,
    reset,
  };
}
