/**
 * Hook للتحليل بالذكاء الاصطناعي للعقارات
 * @version 2.8.67
 */
import { useState } from "react";
import { EdgeFunctionService } from "@/services";
import { productionLogger } from "@/lib/logger/production-logger";
import { toast } from "sonner";

type ActionType = "analyze_property" | "suggest_maintenance" | "predict_revenue" | "optimize_contracts" | "alert_insights";

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
}

export function usePropertyAI() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");

  const analyze = async (actionType: ActionType, propertyData?: PropertyData) => {
    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const result = await EdgeFunctionService.invoke<{ analysis?: string; error?: string }>('property-ai-assistant', {
        action: actionType,
        data: propertyData
      });

      if (!result.success || result.data?.error) {
        toast.error(result.data?.error || result.error);
        return null;
      }

      setAnalysis(result.data?.analysis || "");
      toast.success("تم التحليل بنجاح!");
      return result.data?.analysis;
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
