import { useState, useMemo } from 'react';
import { SortDirection } from '@/components/shared/SortableTableHeader';

interface UseSortableTableProps<T> {
  data: T[];
  defaultSortKey?: string;
  defaultDirection?: SortDirection;
}

export function useTableSort<T extends Record<string, any>>({
  data,
  defaultSortKey,
  defaultDirection = 'asc',
}: UseSortableTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: SortDirection;
  }>({
    key: defaultSortKey || null,
    direction: defaultDirection,
  });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue, 'ar');
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue), 'ar');
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const handleSort = (key: string, direction: SortDirection) => {
    setSortConfig({ key, direction });
  };

  return {
    sortedData,
    sortConfig,
    handleSort,
  };
}
