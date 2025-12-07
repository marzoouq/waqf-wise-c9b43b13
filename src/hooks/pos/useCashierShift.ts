import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';

export interface CashierShift {
  id: string;
  shift_number: string;
  cashier_id: string;
  cashier_name: string | null;
  opening_balance: number;
  closing_balance: number | null;
  expected_balance: number | null;
  variance: number;
  total_collections: number;
  total_payments: number;
  transactions_count: number;
  status: 'مفتوحة' | 'مغلقة' | 'معلقة';
  opened_at: string;
  closed_at: string | null;
  closed_by: string | null;
  notes: string | null;
  created_at: string;
}

export function useCashierShift() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // جلب الجلسة الحالية النشطة
  const { data: currentShift, isLoading: isLoadingShift } = useQuery({
    queryKey: ['pos', 'current-shift'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cashier_shifts')
        .select('*')
        .eq('status', 'مفتوحة')
        .order('opened_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as CashierShift | null;
    },
  });

  // جلب جميع الجلسات
  const { data: shifts = [], isLoading: isLoadingShifts } = useQuery({
    queryKey: ['pos', 'shifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cashier_shifts')
        .select('*')
        .order('opened_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CashierShift[];
    },
  });

  // بدء جلسة عمل جديدة (مبسط - بدون رصيد افتتاحي)
  const openShiftMutation = useMutation({
    mutationFn: async ({ notes }: { notes?: string }) => {
      // التحقق من عدم وجود جلسة نشطة
      const { data: existingShift } = await supabase
        .from('cashier_shifts')
        .select('id')
        .eq('status', 'مفتوحة')
        .maybeSingle();

      if (existingShift) {
        throw new Error('يوجد جلسة عمل نشطة بالفعل. يجب إنهاؤها أولاً.');
      }

      // توليد رقم الجلسة
      const { data: shiftNumber } = await supabase.rpc('generate_shift_number');

      // جلب اسم المستخدم
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('cashier_shifts')
        .insert({
          shift_number: shiftNumber,
          cashier_id: user?.id,
          cashier_name: profile?.full_name || 'غير معروف',
          opening_balance: 0, // دائماً صفر - لا نحتاج رصيد افتتاحي
          expected_balance: 0,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('تم بدء جلسة العمل بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء بدء الجلسة');
    },
  });

  // إنهاء جلسة العمل (مبسط - بدون رصيد ختامي أو فروقات)
  const closeShiftMutation = useMutation({
    mutationFn: async ({ shiftId, notes }: { 
      shiftId: string; 
      notes?: string 
    }) => {
      const shift = shifts.find(s => s.id === shiftId) || currentShift;
      if (!shift) throw new Error('الجلسة غير موجودة');

      const { data, error } = await supabase
        .from('cashier_shifts')
        .update({
          closing_balance: 0, // لا نحتاج رصيد ختامي
          expected_balance: 0,
          variance: 0, // لا نحتاج فروقات
          status: 'مغلقة',
          closed_at: new Date().toISOString(),
          closed_by: user?.id,
          notes: notes || shift.notes,
        })
        .eq('id', shiftId)
        .select()
        .single();

      if (error) throw error;
      return data;
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
