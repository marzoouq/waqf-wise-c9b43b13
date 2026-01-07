/**
 * POS Realtime Hook
 * @version 2.0.0 - تم إصلاح مشكلة تراكم الاشتراكات
 */
import { useEffect } from 'react';
import { realtimeManager } from '@/services/realtime-manager';
import { queryInvalidationManager } from '@/lib/query-invalidation-manager';

export function usePOSRealtime() {
  useEffect(() => {
    const unsubShifts = realtimeManager.subscribe('cashier_shifts', () => {
      queryInvalidationManager.invalidateMultiple([
        ['pos', 'current-shift'],
        ['pos', 'shifts']
      ]);
    });

    const unsubTransactions = realtimeManager.subscribe('pos_transactions', () => {
      queryInvalidationManager.invalidate(['pos', 'transactions']);
    });

    const unsubRentals = realtimeManager.subscribe('rental_payments', () => {
      queryInvalidationManager.invalidate(['pos', 'pending-rentals']);
    });

    return () => {
      unsubShifts();
      unsubTransactions();
      unsubRentals();
    };
  }, []); // لا تبعيات
}
