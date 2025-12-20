/**
 * AI System Audit Hook - خطاف الفحص الذكي للنظام
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AISystemAuditService, 
  SystemAudit, 
  PendingFix,
  AUDIT_CATEGORIES 
} from '@/services/ai-system-audit.service';
import { toastSuccess, toastError } from '@/hooks/ui/use-toast';

export function useAISystemAudit() {
  const queryClient = useQueryClient();
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);

  // جلب تقارير الفحص
  const { 
    data: audits = [], 
    isLoading: isLoadingAudits,
    refetch: refetchAudits 
  } = useQuery({
    queryKey: ['ai-system-audits'],
    queryFn: () => AISystemAuditService.getAudits(20),
    staleTime: 30000
  });

  // جلب الإصلاحات المعلقة
  const { 
    data: pendingFixes = [], 
    isLoading: isLoadingFixes,
    refetch: refetchFixes 
  } = useQuery({
    queryKey: ['pending-system-fixes'],
    queryFn: () => AISystemAuditService.getPendingFixes(),
    staleTime: 30000
  });

  // تشغيل فحص جديد
  const runAudit = useCallback(async (
    auditType: 'full' | 'category' = 'full',
    categories?: string[]
  ) => {
    setIsAuditing(true);
    setAuditProgress(0);

    // محاكاة التقدم
    const progressInterval = setInterval(() => {
      setAuditProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const result = await AISystemAuditService.runAudit(auditType, categories);
      
      clearInterval(progressInterval);
      setAuditProgress(100);

      if (result.success) {
        toastSuccess('تم إكمال الفحص الذكي بنجاح');
        await refetchAudits();
        await refetchFixes();
      } else {
        toastError(result.error || 'فشل في تشغيل الفحص');
      }

      return result;
    } catch (error: any) {
      clearInterval(progressInterval);
      toastError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsAuditing(false);
      setTimeout(() => setAuditProgress(0), 1000);
    }
  }, [refetchAudits, refetchFixes]);

  // الموافقة على إصلاح
  const approveFix = useMutation({
    mutationFn: (fixId: string) => AISystemAuditService.approveFix(fixId),
    onSuccess: (result) => {
      if (result.success) {
        toastSuccess('تم تطبيق الإصلاح بنجاح');
        queryClient.invalidateQueries({ queryKey: ['pending-system-fixes'] });
        queryClient.invalidateQueries({ queryKey: ['ai-system-audits'] });
      } else {
        toastError(result.error || 'فشل في تطبيق الإصلاح');
      }
    }
  });

  // رفض إصلاح
  const rejectFix = useMutation({
    mutationFn: (fixId: string) => AISystemAuditService.rejectFix(fixId),
    onSuccess: (result) => {
      if (result.success) {
        toastSuccess('تم رفض الإصلاح');
        queryClient.invalidateQueries({ queryKey: ['pending-system-fixes'] });
      } else {
        toastError(result.error || 'فشل في رفض الإصلاح');
      }
    }
  });

  // التراجع عن إصلاح
  const rollbackFix = useMutation({
    mutationFn: (fixId: string) => AISystemAuditService.rollbackFix(fixId),
    onSuccess: (result) => {
      if (result.success) {
        toastSuccess('تم التراجع عن الإصلاح');
        queryClient.invalidateQueries({ queryKey: ['pending-system-fixes'] });
        queryClient.invalidateQueries({ queryKey: ['ai-system-audits'] });
      } else {
        toastError(result.error || 'فشل في التراجع عن الإصلاح');
      }
    }
  });

  // حذف تقرير فحص
  const deleteAudit = useMutation({
    mutationFn: (auditId: string) => AISystemAuditService.deleteAudit(auditId),
    onSuccess: (result) => {
      if (result.success) {
        toastSuccess('تم حذف التقرير');
        queryClient.invalidateQueries({ queryKey: ['ai-system-audits'] });
      } else {
        toastError(result.error || 'فشل في حذف التقرير');
      }
    }
  });

  // إحصائيات الفحوصات
  const auditStats = {
    totalAudits: audits.length,
    lastAudit: audits[0] || null,
    pendingFixesCount: pendingFixes.length,
    criticalIssues: pendingFixes.filter(f => f.severity === 'critical').length
  };

  return {
    // البيانات
    audits,
    pendingFixes,
    auditStats,
    categories: AUDIT_CATEGORIES,
    
    // الحالة
    isAuditing,
    auditProgress,
    isLoadingAudits,
    isLoadingFixes,
    
    // الإجراءات
    runAudit,
    approveFix: approveFix.mutate,
    rejectFix: rejectFix.mutate,
    rollbackFix: rollbackFix.mutate,
    deleteAudit: deleteAudit.mutate,
    refetchAudits,
    refetchFixes,
    
    // حالة التحميل
    isApproving: approveFix.isPending,
    isRejecting: rejectFix.isPending,
    isRollingBack: rollbackFix.isPending,
    isDeleting: deleteAudit.isPending
  };
}

export { AUDIT_CATEGORIES };
