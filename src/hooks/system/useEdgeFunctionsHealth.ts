/**
 * Hook لمراقبة صحة Edge Functions
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  EdgeFunctionsHealthService, 
  ALL_EDGE_FUNCTIONS,
  type EdgeFunctionHealth,
  type HealthCheckResult,
  type EdgeFunctionInfo
} from '@/services/edge-functions-health.service';
import { toastSuccess, toastError } from '@/hooks/ui/use-toast';

export function useEdgeFunctionsHealth() {
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [lastResults, setLastResults] = useState<HealthCheckResult[]>([]);

  // الحصول على قائمة Edge Functions
  const functions = ALL_EDGE_FUNCTIONS;

  // تصنيف الـ functions
  const functionsByCategory = {
    ai: functions.filter(f => f.category === 'ai'),
    database: functions.filter(f => f.category === 'database'),
    notification: functions.filter(f => f.category === 'notification'),
    backup: functions.filter(f => f.category === 'backup'),
    security: functions.filter(f => f.category === 'security'),
    utility: functions.filter(f => f.category === 'utility'),
  };

  // فحص function واحدة
  const checkSingleFunction = useCallback(async (functionName: string) => {
    try {
      const result = await EdgeFunctionsHealthService.checkFunction(functionName);
      
      setLastResults(prev => {
        const existing = prev.findIndex(r => r.function === functionName);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = result;
          return updated;
        }
        return [...prev, result];
      });

      if (result.success) {
        toastSuccess(`${functionName}: ${result.responseTime}ms`);
      } else {
        toastError(`${functionName}: ${result.error}`);
      }

      return result;
    } catch (error: any) {
      toastError(`خطأ في فحص ${functionName}`);
      return null;
    }
  }, []);

  // فحص مجموعة من الـ functions
  const checkMultipleFunctions = useCallback(async (functionNames: string[]) => {
    setIsChecking(true);
    setCheckProgress(0);

    const results: HealthCheckResult[] = [];
    const total = functionNames.length;

    for (let i = 0; i < total; i++) {
      const result = await EdgeFunctionsHealthService.checkFunction(functionNames[i]);
      results.push(result);
      setCheckProgress(Math.round(((i + 1) / total) * 100));
    }

    setLastResults(results);
    setIsChecking(false);

    const summary = EdgeFunctionsHealthService.calculateHealthSummary(results);
    
    if (summary.unhealthy > 0) {
      toastError(`${summary.unhealthy} وظائف غير متاحة من ${summary.total}`);
    } else if (summary.degraded > 0) {
      toastSuccess(`${summary.healthy} صحية، ${summary.degraded} بطيئة`);
    } else {
      toastSuccess(`جميع الوظائف (${summary.total}) تعمل بشكل طبيعي`);
    }

    return results;
  }, []);

  // فحص جميع الـ functions
  const checkAllFunctions = useCallback(async () => {
    const allNames = functions.map(f => f.name);
    return checkMultipleFunctions(allNames);
  }, [functions, checkMultipleFunctions]);

  // فحص فئة معينة
  const checkCategory = useCallback(async (category: EdgeFunctionInfo['category']) => {
    const categoryFunctions = functions.filter(f => f.category === category);
    return checkMultipleFunctions(categoryFunctions.map(f => f.name));
  }, [functions, checkMultipleFunctions]);

  // الحصول على حالة function معينة
  const getFunctionHealth = useCallback((functionName: string): EdgeFunctionHealth | null => {
    const result = lastResults.find(r => r.function === functionName);
    if (!result) return null;
    return EdgeFunctionsHealthService.resultToHealth(result);
  }, [lastResults]);

  // الحصول على ملخص الصحة
  const healthSummary = EdgeFunctionsHealthService.calculateHealthSummary(lastResults);

  // تحويل النتائج إلى حالات صحية
  const healthStatuses: EdgeFunctionHealth[] = lastResults.map(r => 
    EdgeFunctionsHealthService.resultToHealth(r)
  );

  return {
    // البيانات
    functions,
    functionsByCategory,
    lastResults,
    healthStatuses,
    healthSummary,
    
    // الحالة
    isChecking,
    checkProgress,
    
    // الإجراءات
    checkSingleFunction,
    checkMultipleFunctions,
    checkAllFunctions,
    checkCategory,
    getFunctionHealth,
  };
}

export const CATEGORY_LABELS: Record<EdgeFunctionInfo['category'], string> = {
  ai: 'الذكاء الاصطناعي',
  database: 'قاعدة البيانات',
  notification: 'الإشعارات',
  backup: 'النسخ الاحتياطي',
  security: 'الأمان',
  utility: 'الأدوات العامة',
};

export const CATEGORY_ICONS: Record<EdgeFunctionInfo['category'], string> = {
  ai: '🤖',
  database: '🗄️',
  notification: '🔔',
  backup: '💾',
  security: '🔒',
  utility: '🔧',
};
