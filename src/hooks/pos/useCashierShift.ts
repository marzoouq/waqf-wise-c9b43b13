import { useState } from 'react';
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

  // جلب الوردية الحالية المفتوحة
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

  // جلب جميع الورديات
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

  // فتح وردية جديدة
  const openShiftMutation = useMutation({
    mutationFn: async ({ openingBalance, notes }: { openingBalance: number; notes?: string }) => {
      // التحقق من عدم وجود وردية مفتوحة
      const { data: existingShift } = await supabase
        .from('cashier_shifts')
        .select('id')
        .eq('status', 'مفتوحة')
        .maybeSingle();

      if (existingShift) {
        throw new Error('يوجد وردية مفتوحة بالفعل. يجب إغلاقها أولاً.');
      }

      // توليد رقم الوردية
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
          opening_balance: openingBalance,
          expected_balance: openingBalance,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('تم فتح الوردية بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء فتح الوردية');
    },
  });

  // إغلاق الوردية
  const closeShiftMutation = useMutation({
    mutationFn: async ({ shiftId, closingBalance, notes }: { 
      shiftId: string; 
      closingBalance: number; 
      notes?: string 
    }) => {
      // حساب الفرق
      const shift = shifts.find(s => s.id === shiftId) || currentShift;
      if (!shift) throw new Error('الوردية غير موجودة');

      const expectedBalance = shift.opening_balance + shift.total_collections - shift.total_payments;
      const variance = closingBalance - expectedBalance;

      const { data, error } = await supabase
        .from('cashier_shifts')
        .update({
          closing_balance: closingBalance,
          expected_balance: expectedBalance,
          variance,
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
      if (Math.abs(data.variance) > 0) {
        toast.warning(`تم إغلاق الوردية مع فرق ${data.variance.toFixed(2)} ريال`);
      } else {
        toast.success('تم إغلاق الوردية بنجاح - الصندوق مطابق');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء إغلاق الوردية');
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
