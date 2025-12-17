/**
 * جدول افتراضي محسّن للقوائم الكبيرة (100+ سجل)
 * يستخدم @tanstack/react-virtual لتحسين الأداء
 * v2.9.33
 */

import { useRef, ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface VirtualColumn<T> {
  key: keyof T | string;
  label: string;
  width?: number | string;
  className?: string;
  render?: (value: unknown, row: T) => ReactNode;
}

export interface VirtualizedTableProps<T> {
  columns: VirtualColumn<T>[];
  data: T[];
  rowHeight?: number;
  maxHeight?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  getRowKey?: (row: T, index: number) => string;
  className?: string;
}

/**
 * جدول افتراضي للقوائم الكبيرة
 * يعرض فقط الصفوف المرئية لتحسين الأداء
 */
export function VirtualizedTable<T>({
  columns,
  data,
  rowHeight = 48,
  maxHeight = 600,
  emptyMessage = 'لا توجد بيانات',
  onRowClick,
  getRowKey,
  className,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5, // عدد الصفوف الإضافية للتحميل المسبق
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={String(col.key)}
                className={col.className}
                style={{ width: col.width }}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>

      <ScrollArea
        ref={parentRef}
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <div
          style={{
            height: `${totalSize}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <Table>
            <TableBody>
              {virtualRows.map((virtualRow) => {
                const row = data[virtualRow.index];
                const rowKey = getRowKey
                  ? getRowKey(row, virtualRow.index)
                  : `row-${virtualRow.index}`;

                return (
                  <TableRow
                    key={rowKey}
                    className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                    onClick={() => onRowClick?.(row)}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      display: 'table-row',
                    }}
                  >
                    {columns.map((col) => {
                      const value = (row as Record<string, unknown>)[String(col.key)];
                      const displayValue = col.render
                        ? col.render(value, row)
                        : String(value ?? '');

                      return (
                        <TableCell
                          key={String(col.key)}
                          className={col.className}
                          style={{ width: col.width }}
                        >
                          {displayValue}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {/* مؤشر عدد السجلات */}
      <div className="px-3 py-2 text-xs text-muted-foreground border-t bg-muted/30">
        إجمالي السجلات: {data.length.toLocaleString('ar-SA')}
      </div>
    </div>
  );
}

export default VirtualizedTable;
