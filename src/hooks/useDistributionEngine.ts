import { useState, useCallback } from 'react';
import { DistributionEngine, DistributionParams, DistributionResult, DistributionSummary } from '@/lib/distribution-engine';
import { useToast } from './use-toast';

export interface SimulationResult {
  results: DistributionResult[];
  summary: DistributionSummary;
  pattern: string;
  timestamp: string;
}

export function useDistributionEngine() {
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [scenarios, setScenarios] = useState<SimulationResult[]>([]);

  /**
   * حساب توزيع واحد
   */
  const calculate = useCallback(
    async (params: DistributionParams): Promise<SimulationResult | null> => {
      setIsCalculating(true);
      try {
        const result = DistributionEngine.calculate(params);
        
        const simulation: SimulationResult = {
          results: result.results,
          summary: result.summary,
          pattern: params.pattern,
          timestamp: new Date().toISOString(),
        };

        toast({
          title: 'تم حساب التوزيع بنجاح',
          description: `نمط التوزيع: ${result.summary.pattern_used}`,
        });

        return simulation;
      } catch (error) {
        console.error('خطأ في حساب التوزيع:', error);
        toast({
          title: 'خطأ في الحساب',
          description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsCalculating(false);
      }
    },
    [toast]
  );

  /**
   * حساب عدة سيناريوهات للمقارنة
   */
  const calculateMultipleScenarios = useCallback(
    async (
      baseParams: Omit<DistributionParams, 'pattern'>,
      patterns: DistributionParams['pattern'][]
    ): Promise<SimulationResult[]> => {
      setIsCalculating(true);
      const results: SimulationResult[] = [];

      try {
        for (const pattern of patterns) {
          const params = { ...baseParams, pattern };
          const result = DistributionEngine.calculate(params);
          
          results.push({
            results: result.results,
            summary: result.summary,
            pattern,
            timestamp: new Date().toISOString(),
          });
        }

        setScenarios(results);

        toast({
          title: 'تم حساب السيناريوهات',
          description: `تم حساب ${results.length} سيناريو للمقارنة`,
        });

        return results;
      } catch (error) {
        console.error('خطأ في حساب السيناريوهات:', error);
        toast({
          title: 'خطأ في الحساب',
          description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
          variant: 'destructive',
        });
        return [];
      } finally {
        setIsCalculating(false);
      }
    },
    [toast]
  );

  /**
   * مسح السيناريوهات المحفوظة
   */
  const clearScenarios = useCallback(() => {
    setScenarios([]);
  }, []);

  /**
   * الحصول على توصية بأفضل نمط توزيع
   */
  const getRecommendation = useCallback(
    (beneficiaries: DistributionParams['beneficiaries']): DistributionParams['pattern'] => {
      // إذا كان هناك أنواع مستفيدين واضحة (ولد/بنت/زوجة)
      const hasShariahTypes = beneficiaries.some(b => {
        const type = b.beneficiary_type?.toLowerCase() || '';
        return type.includes('ولد') || type.includes('بنت') || type.includes('زوجة');
      });

      if (hasShariahTypes) {
        return 'shariah';
      }

      // إذا كان هناك تباين كبير في الدخل أو حجم الأسرة
      const hasIncomeData = beneficiaries.some(b => b.monthly_income && b.monthly_income > 0);
      const hasFamilySizeData = beneficiaries.some(b => (b.family_size || 0) > 1);

      if (hasIncomeData || hasFamilySizeData) {
        return 'need_based';
      }

      // افتراضي: التوزيع المتساوي
      return 'equal';
    },
    []
  );

  return {
    calculate,
    calculateMultipleScenarios,
    clearScenarios,
    getRecommendation,
    isCalculating,
    scenarios,
  };
}
