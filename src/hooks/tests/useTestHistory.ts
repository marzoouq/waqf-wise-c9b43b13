/**
 * Hook لإدارة سجل الاختبارات التاريخية
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toastSuccess, toastError } from '@/hooks/ui/use-toast';

export interface TestRun {
  id: string;
  run_date: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  pass_rate: number;
  avg_duration: number;
  categories_summary: Record<string, { passed: number; failed: number; total: number }>;
  failed_tests_details: Array<{ testId: string; testName: string; category: string; message: string }>;
  triggered_by: string;
  run_duration_seconds: number;
  created_by: string | null;
  notes: string | null;
}

export interface TestResult {
  testId: string;
  testName: string;
  category: string;
  success: boolean;
  duration: number;
  message?: string;
  timestamp: Date;
}

export function useTestHistory() {
  const queryClient = useQueryClient();

  // جلب آخر 30 تشغيل
  const { data: history = [], isLoading, refetch } = useQuery({
    queryKey: ['test-runs-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_runs')
        .select('*')
        .order('run_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return (data || []) as TestRun[];
    },
    staleTime: 30000, // 30 ثانية
  });

  // حفظ نتيجة تشغيل جديدة
  const saveRunMutation = useMutation({
    mutationFn: async (params: {
      results: TestResult[];
      totalTests: number;
      runDurationSeconds: number;
      triggeredBy?: string;
      notes?: string;
    }) => {
      const { results, totalTests, runDurationSeconds, triggeredBy = 'manual', notes } = params;
      
      const passed = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const passRate = results.length > 0 ? (passed / results.length) * 100 : 0;
      const avgDuration = results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)
        : 0;

      // تجميع الفئات
      const categoriesSummary: Record<string, { passed: number; failed: number; total: number }> = {};
      results.forEach(r => {
        if (!categoriesSummary[r.category]) {
          categoriesSummary[r.category] = { passed: 0, failed: 0, total: 0 };
        }
        categoriesSummary[r.category].total++;
        if (r.success) {
          categoriesSummary[r.category].passed++;
        } else {
          categoriesSummary[r.category].failed++;
        }
      });

      // تفاصيل الاختبارات الفاشلة
      const failedDetails = results
        .filter(r => !r.success)
        .map(r => ({
          testId: r.testId,
          testName: r.testName,
          category: r.category,
          message: r.message || 'فشل بدون رسالة'
        }));

      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('test_runs')
        .insert({
          total_tests: totalTests,
          passed_tests: passed,
          failed_tests: failed,
          pass_rate: Number(passRate.toFixed(2)),
          avg_duration: avgDuration,
          categories_summary: categoriesSummary,
          failed_tests_details: failedDetails,
          triggered_by: triggeredBy,
          run_duration_seconds: runDurationSeconds,
          created_by: userData?.user?.id || null,
          notes
        })
        .select()
        .single();

      if (error) throw error;
      return data as TestRun;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-runs-history'] });
      toastSuccess('تم حفظ نتيجة الاختبار');
    },
    onError: (error: any) => {
      console.error('Error saving test run:', error);
      toastError('فشل حفظ النتيجة: ' + error.message);
    }
  });

  // حذف سجل
  const deleteRunMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('test_runs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-runs-history'] });
      toastSuccess('تم حذف السجل');
    },
    onError: (error: any) => {
      toastError('فشل الحذف: ' + error.message);
    }
  });

  // حساب الإحصائيات
  const stats = {
    totalRuns: history.length,
    avgPassRate: history.length > 0 
      ? Number((history.reduce((sum, r) => sum + Number(r.pass_rate), 0) / history.length).toFixed(1))
      : 0,
    bestRun: history.length > 0 
      ? history.reduce((best, r) => Number(r.pass_rate) > Number(best.pass_rate) ? r : best, history[0])
      : null,
    worstRun: history.length > 0
      ? history.reduce((worst, r) => Number(r.pass_rate) < Number(worst.pass_rate) ? r : worst, history[0])
      : null,
    trend: calculateTrend(history),
    recentFailures: getRecentFailures(history),
  };

  return {
    history,
    isLoading,
    stats,
    saveRun: saveRunMutation.mutateAsync,
    deleteRun: deleteRunMutation.mutate,
    isSaving: saveRunMutation.isPending,
    refetch,
  };
}

// حساب الاتجاه (تحسن أو تراجع)
function calculateTrend(history: TestRun[]): 'improving' | 'declining' | 'stable' | 'unknown' {
  if (history.length < 3) return 'unknown';

  const recent = history.slice(0, 3);
  const older = history.slice(3, 6);

  if (older.length === 0) return 'unknown';

  const recentAvg = recent.reduce((sum, r) => sum + Number(r.pass_rate), 0) / recent.length;
  const olderAvg = older.reduce((sum, r) => sum + Number(r.pass_rate), 0) / older.length;

  const diff = recentAvg - olderAvg;

  if (diff > 2) return 'improving';
  if (diff < -2) return 'declining';
  return 'stable';
}

// الحصول على الإخفاقات المتكررة
function getRecentFailures(history: TestRun[]): Array<{ testName: string; count: number }> {
  const failureCounts: Record<string, number> = {};

  history.slice(0, 10).forEach(run => {
    const details = run.failed_tests_details as Array<{ testName: string }>;
    details?.forEach(f => {
      failureCounts[f.testName] = (failureCounts[f.testName] || 0) + 1;
    });
  });

  return Object.entries(failureCounts)
    .map(([testName, count]) => ({ testName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
