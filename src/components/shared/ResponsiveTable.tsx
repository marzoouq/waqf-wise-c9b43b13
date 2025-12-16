import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { useMediaQuery } from '@/hooks/ui/use-media-query';
import { cn } from '@/lib/utils';
import { ScrollableTableWrapper } from './ScrollableTableWrapper';
import { TableRow as TableRowType, TableColumn, ResponsiveTableProps } from '@/types/table';

/**
 * جدول محسّن للجوال مع دعم Generic Types
 * يمكن عرضه كـ cards على الجوال أو جدول قابل للتمرير
 */
export function ResponsiveTable<T extends TableRowType = TableRowType>({
  columns,
  data,
  emptyMessage = 'لا توجد بيانات',
  onRowClick,
  mobileCardView = true,
  mobileCardRender,
}: ResponsiveTableProps<T>) {
  const isMobile = useMediaQuery('(max-width: 640px)');

  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // عرض Cards على الجوال
  if (isMobile && mobileCardView) {
    return (
      <div className="space-y-2 sm:space-y-3">
        {data.map((row, index) => {
          const rowId = row.id || `row-${index}`;
          return (
            <Card
              key={rowId}
              className={cn(
                'p-3 sm:p-4 space-y-1.5 sm:space-y-2',
                onRowClick && 'cursor-pointer hover:bg-muted/50 transition-colors'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {mobileCardRender ? (
                mobileCardRender(row)
              ) : (
                <div className="space-y-1.5 sm:space-y-2">
                  {columns
                    .filter(col => !col.mobileHidden)
                    .map((col) => {
                      const value = col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '');
                      return (
                        <div key={col.key} className="flex justify-between items-start gap-2">
                          <span className="text-xs sm:text-sm text-muted-foreground font-medium min-w-[80px] sm:min-w-[100px]">
                            {col.label}:
                          </span>
                          <span className="text-xs sm:text-sm flex-1 text-left">
                            {value}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  // عرض Table على الشاشات الكبيرة أو عند تعطيل card view
  return (
    <ScrollableTableWrapper showScrollIndicator={isMobile}>
      <div className="rounded-md border min-w-max">
        <Table>
          <TableHeader>
            <TableRow>
              {columns
                .filter(col => !col.mobileHidden || !isMobile)
                .map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.label}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => {
              const rowId = row.id || `row-${index}`;
              return (
                <TableRow
                  key={rowId}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns
                    .filter(col => !col.mobileHidden || !isMobile)
                    .map((col) => {
                      const value = col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '');
                      return (
                        <TableCell key={col.key} className={col.className}>
                          {value}
                        </TableCell>
                      );
                    })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ScrollableTableWrapper>
  );
}