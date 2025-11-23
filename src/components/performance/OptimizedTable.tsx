/**
 * جدول محسّن الأداء مع Virtualization
 * يستخدم react-virtual لعرض صفوف كبيرة بكفاءة
 */

import { memo, useMemo } from 'react';
import { useVirtualization } from '@/hooks/useVirtualization';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OptimizedTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    render: (item: T) => React.ReactNode;
  }[];
  rowHeight?: number;
  containerHeight?: string;
}

function OptimizedTableComponent<T extends { id: string }>({
  data,
  columns,
  rowHeight = 60,
  containerHeight = '600px',
}: OptimizedTableProps<T>) {
  const { virtualRows, totalSize, scrollRef } = useVirtualization({
    count: data.length,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  const visibleData = useMemo(() => {
    return virtualRows.map((virtualRow) => ({
      ...virtualRow,
      data: data[virtualRow.index],
    }));
  }, [virtualRows, data]);

  return (
    <div 
      ref={scrollRef}
      style={{ 
        height: containerHeight, 
        overflow: 'auto',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
      }}
    >
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <tr style={{ height: `${totalSize}px` }}>
            <td style={{ padding: 0, border: 0 }} />
          </tr>
          {visibleData.map((virtualRow) => (
            <TableRow
              key={virtualRow.data.id}
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render(virtualRow.data)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const OptimizedTable = memo(OptimizedTableComponent) as typeof OptimizedTableComponent;
