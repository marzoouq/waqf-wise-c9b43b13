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
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
  className?: string;
  mobileHidden?: boolean; // إخفاء العمود على الجوال
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  mobileCardView?: boolean; // عرض البيانات كـ cards على الجوال
  mobileCardRender?: (row: any) => ReactNode;
}

/**
 * جدول محسّن للجوال
 * يمكن عرضه كـ cards على الجوال أو جدول قابل للتمرير
 */
export function ResponsiveTable({
  columns,
  data,
  emptyMessage = 'لا توجد بيانات',
  onRowClick,
  mobileCardView = true,
  mobileCardRender,
}: ResponsiveTableProps) {
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
      <div className="space-y-3">
        {data.map((row, index) => {
          const rowId = (row as any).id || `row-${index}`;
          return (
            <Card
              key={rowId}
              className={cn(
                'p-4 space-y-2',
                onRowClick && 'cursor-pointer hover:bg-muted/50 transition-colors'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {mobileCardRender ? (
                mobileCardRender(row)
              ) : (
                <div className="space-y-2">
                  {columns
                    .filter(col => !col.mobileHidden)
                    .map((col) => (
                      <div key={col.key} className="flex justify-between items-start gap-2">
                        <span className="text-sm text-muted-foreground font-medium min-w-[100px]">
                          {col.label}:
                        </span>
                        <span className="text-sm flex-1 text-left">
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </span>
                      </div>
                    ))}
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
    <div className="rounded-md border overflow-x-auto">
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
            const rowId = (row as any).id || `row-${index}`;
            return (
              <TableRow
                key={rowId}
                className={cn(onRowClick && 'cursor-pointer')}
                onClick={() => onRowClick?.(row)}
              >
                {columns
                  .filter(col => !col.mobileHidden || !isMobile)
                  .map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}