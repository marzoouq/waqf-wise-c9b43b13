import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface LoanCalculationParams {
  loanId: string;
  principal: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
}

/**
 * Hook لحساب جدول أقساط القرض بدقة عالية
 */
export function usePreciseLoanCalculation() {
  const { toast } = useToast();

  const calculateSchedule = useMutation({
    mutationFn: async (params: LoanCalculationParams) => {
      const { data, error } = await (supabase as any).rpc('calculate_precise_loan_schedule', {
        p_loan_id: params.loanId,
        p_principal: params.principal,
        p_interest_rate: params.interestRate,
        p_term_months: params.termMonths,
        p_start_date: params.startDate.toISOString().split('T')[0],
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'تم حساب جدول الأقساط',
        description: 'تم حساب جدول أقساط القرض بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في حساب الأقساط',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  /**
   * حساب القسط الشهري فقط (بدون حفظ في قاعدة البيانات)
   */
  const calculateMonthlyPayment = (
    principal: number,
    annualRate: number,
    months: number
  ): number => {
    if (annualRate === 0) {
      return principal / months;
    }

    const monthlyRate = annualRate / 12 / 100;
    const payment =
      principal *
      (monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return Math.round(payment * 100) / 100;
  };

  /**
   * حساب جدول الأقساط الكامل للعرض (بدون حفظ)
   */
  const generateSchedulePreview = (
    principal: number,
    annualRate: number,
    months: number,
    startDate: Date
  ) => {
    const monthlyRate = annualRate / 12 / 100;
    const monthlyPayment = calculateMonthlyPayment(principal, annualRate, months);
    let remainingBalance = principal;
    const schedule = [];

    for (let i = 1; i <= months; i++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + i);

      let interestPayment = 0;
      let principalPayment = 0;

      if (annualRate > 0) {
        interestPayment = Math.round(remainingBalance * monthlyRate * 100) / 100;
        principalPayment = Math.round((monthlyPayment - interestPayment) * 100) / 100;
      } else {
        principalPayment = Math.round(monthlyPayment * 100) / 100;
      }

      // التأكد من أن القسط الأخير يساوي المبلغ المتبقي بالضبط
      if (i === months) {
        principalPayment = remainingBalance;
      }

      remainingBalance = Math.max(0, remainingBalance - principalPayment);

      schedule.push({
        installmentNumber: i,
        dueDate: currentDate,
        principalAmount: principalPayment,
        interestAmount: interestPayment,
        totalAmount: principalPayment + interestPayment,
        remainingAmount: remainingBalance,
      });
    }

    return schedule;
  };

  return {
    calculateSchedule: calculateSchedule.mutateAsync,
    isCalculating: calculateSchedule.isPending,
    calculateMonthlyPayment,
    generateSchedulePreview,
  };
}
