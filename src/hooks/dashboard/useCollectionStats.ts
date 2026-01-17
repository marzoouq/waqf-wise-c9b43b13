/**
 * Hook for Collection Statistics - إحصائيات التحصيل
 * يجلب بيانات التحصيل الموحدة للوحات التحكم
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CollectionStats {
  // إحصائيات التحصيل
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  
  // الدفعات
  pendingPayments: number;
  overduePayments: number;
  paidPayments: number;
  
  // المتأخرات
  totalOverdueAmount: number;
  overduePaymentsList: OverduePayment[];
  
  // دفعات اليوم
  todayDuePayments: TodayDuePayment[];
  todayDueAmount: number;
  
  // العقود المنتهية قريباً
  expiringContracts: ExpiringContract[];
}

export interface OverduePayment {
  id: string;
  tenantName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  propertyName?: string;
}

export interface TodayDuePayment {
  id: string;
  tenantName: string;
  amount: number;
  unitName?: string;
}

export interface ExpiringContract {
  id: string;
  tenantName: string;
  propertyName: string;
  endDate: string;
  daysRemaining: number;
  monthlyRent: number;
}

export function useCollectionStats() {
  return useQuery({
    queryKey: ['collection-stats'],
    queryFn: async (): Promise<CollectionStats> => {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // جلب جميع البيانات بشكل متوازي
      const [
        paymentsResult,
        overdueResult,
        todayDueResult,
        expiringContractsResult,
      ] = await Promise.all([
        // جميع دفعات الإيجار
        supabase
          .from('rental_payments')
          .select('id, amount_due, amount_paid, status, due_date'),
        
        // الدفعات المتأخرة
        supabase
          .from('rental_payments')
          .select('id, amount_due, due_date, contract_id')
          .lt('due_date', today)
          .in('status', ['معلقة', 'pending', 'overdue', 'متأخرة'])
          .order('due_date', { ascending: true })
          .limit(10),
        
        // دفعات اليوم
        supabase
          .from('rental_payments')
          .select('id, amount_due, contract_id')
          .eq('due_date', today)
          .in('status', ['معلقة', 'pending'])
          .limit(10),
        
        // العقود المنتهية قريباً
        supabase
          .from('contracts')
          .select(`
            id,
            end_date,
            monthly_rent,
            tenants:tenant_id (full_name),
            properties:property_id (name)
          `)
          .eq('status', 'نشط')
          .lte('end_date', thirtyDaysFromNow.toISOString().split('T')[0])
          .gte('end_date', today)
          .order('end_date', { ascending: true })
          .limit(5),
      ]);

      const payments = paymentsResult.data || [];
      const overdueData = overdueResult.data || [];
      const todayDueData = todayDueResult.data || [];
      const expiringData = expiringContractsResult.data || [];

      // حساب الإحصائيات
      const totalExpected = payments.reduce((sum, p) => sum + (p.amount_due || 0), 0);
      const totalCollected = payments
        .filter(p => p.status === 'مدفوع' || p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount_paid || 0), 0);
      
      const collectionRate = totalExpected > 0 
        ? Math.round((totalCollected / totalExpected) * 100) 
        : 0;

      const pendingPayments = payments.filter(p => 
        p.status === 'معلقة' || p.status === 'pending'
      ).length;
      
      const overduePayments = payments.filter(p => 
        (p.status === 'معلقة' || p.status === 'pending' || p.status === 'متأخرة' || p.status === 'overdue') &&
        new Date(p.due_date) < new Date(today)
      ).length;
      
      const paidPayments = payments.filter(p => 
        p.status === 'مدفوع' || p.status === 'paid'
      ).length;

      // المتأخرات
      const totalOverdueAmount = payments
        .filter(p => 
          (p.status === 'معلقة' || p.status === 'pending' || p.status === 'متأخرة') &&
          new Date(p.due_date) < new Date(today)
        )
        .reduce((sum, p) => sum + (p.amount_due || 0), 0);

      // تحويل البيانات المتأخرة مع جلب أسماء المستأجرين
      const overduePaymentsList: OverduePayment[] = await Promise.all(
        overdueData.slice(0, 5).map(async (p) => {
          const dueDate = new Date(p.due_date);
          const daysOverdue = Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // جلب اسم المستأجر من العقد
          let tenantName = 'مستأجر';
          let propertyName = 'عقار';
          if (p.contract_id) {
            const { data: contract } = await supabase
              .from('contracts')
              .select('tenant_name, properties:property_id(name)')
              .eq('id', p.contract_id)
              .single();
            if (contract) {
              tenantName = contract.tenant_name || 'مستأجر';
              const prop = contract.properties as unknown as { name: string } | null;
              propertyName = prop?.name || 'عقار';
            }
          }
          
          return {
            id: p.id,
            tenantName,
            amount: p.amount_due || 0,
            dueDate: p.due_date,
            daysOverdue: Math.max(0, daysOverdue),
            propertyName,
          };
        })
      );

      // دفعات اليوم مع أسماء المستأجرين
      const todayDuePayments: TodayDuePayment[] = await Promise.all(
        todayDueData.slice(0, 5).map(async (p) => {
          let tenantName = 'مستأجر';
          let unitName = 'وحدة';
          
          if (p.contract_id) {
            const { data: contract } = await supabase
              .from('contracts')
              .select('tenant_name, property_units:unit_id(unit_number)')
              .eq('id', p.contract_id)
              .single();
            if (contract) {
              tenantName = contract.tenant_name || 'مستأجر';
              const unit = contract.property_units as unknown as { unit_number: string } | null;
              unitName = unit?.unit_number || 'وحدة';
            }
          }
          
          return {
            id: p.id,
            tenantName,
            amount: p.amount_due || 0,
            unitName,
          };
        })
      );

      const todayDueAmount = todayDuePayments.reduce((sum, p) => sum + p.amount, 0);

      // العقود المنتهية
      const expiringContracts: ExpiringContract[] = expiringData.map(c => {
        const endDate = new Date(c.end_date);
        const daysRemaining = Math.floor((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const tenant = c.tenants as unknown as { full_name: string } | null;
        const property = c.properties as unknown as { name: string } | null;
        
        return {
          id: c.id,
          tenantName: tenant?.full_name || 'غير محدد',
          propertyName: property?.name || 'غير محدد',
          endDate: c.end_date,
          daysRemaining: Math.max(0, daysRemaining),
          monthlyRent: c.monthly_rent || 0,
        };
      });

      return {
        totalExpected,
        totalCollected,
        collectionRate,
        pendingPayments,
        overduePayments,
        paidPayments,
        totalOverdueAmount,
        overduePaymentsList,
        todayDuePayments,
        todayDueAmount,
        expiringContracts,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,
  });
}
