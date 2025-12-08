import { useQuery } from '@tanstack/react-query';
import { POSService, PendingRental } from '@/services/pos.service';

export type { PendingRental };

export function usePendingRentals() {
  const { data: pendingRentals = [], isLoading, refetch } = useQuery({
    queryKey: ['pos', 'pending-rentals'],
    queryFn: () => POSService.getPendingRentals(),
  });

  // إحصائيات
  const stats = {
    totalPending: pendingRentals.reduce((sum, r) => sum + r.amount_due, 0),
    overdueCount: pendingRentals.filter(r => r.is_overdue).length,
    overdueAmount: pendingRentals.filter(r => r.is_overdue).reduce((sum, r) => sum + r.amount_due, 0),
    pendingCount: pendingRentals.length,
  };

  return {
    pendingRentals,
    isLoading,
    stats,
    refetch,
  };
}