import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';
import { POSService, CashierShift } from '@/services/pos.service';

export type { CashierShift };

export function useCashierShift() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // جلب الجلسة الحالية النشطة
  const { data: currentShift, isLoading: isLoadingShift } = useQuery({
    queryKey: ['pos', 'current-shift'],
    queryFn: () => POSService.getCurrentShift(),
  });

  // جلب جميع الجلسات
  const { data: shifts = [], isLoading: isLoadingShifts } = useQuery({
    queryKey: ['pos', 'shifts'],
    queryFn: () => POSService.getShifts(50),
  });

  // بدء جلسة عمل جديدة
  const openShiftMutation = useMutation({
    mutationFn: async ({ notes }: { notes?: string }) => {
      if (!user?.id) throw new Error('المستخدم غير مسجل');
      return POSService.openShift(user.id, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('تم بدء جلسة العمل بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء بدء الجلسة');
    },
  });

  // إنهاء جلسة العمل
  const closeShiftMutation = useMutation({
    mutationFn: async ({ shiftId, notes }: { shiftId: string; notes?: string }) => {
      if (!user?.id) throw new Error('المستخدم غير مسجل');
      return POSService.closeShift(shiftId, user.id, notes);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      const netAmount = data.total_collections - data.total_payments;
      toast.success(
        `تم إنهاء الجلسة بنجاح - صافي الحركة: ${netAmount.toLocaleString('ar-SA')} ر.س`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء إنهاء الجلسة');
    },
  });

  return {
    currentShift,
    shifts,
    isLoadingShift,
    isLoadingShifts,
    hasOpenShift: !!currentShift,
    openShift: openShiftMutation.mutate,
    closeShift: closeShiftMutation.mutate,
    isOpeningShift: openShiftMutation.isPending,
    isClosingShift: closeShiftMutation.isPending,
  };
}