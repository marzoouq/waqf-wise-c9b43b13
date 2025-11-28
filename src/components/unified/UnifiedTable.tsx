import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface UnifiedTableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface UnifiedTableProps<T> {
  title?: string;
  description?: string;
  columns: UnifiedTableColumn<T>[];
  data: T[];
  loading?: boolean;
  actions?: ReactNode;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  headerClassName?: string;
}

/**
 * UnifiedTable - جدول موحد مع دعم التحميل والفرز
 * يستخدم لعرض البيانات الجدولية بشكل متناسق
 */
export function UnifiedTable<T extends Record<string, any>>({
  title,
  description,
  columns,
  data,
  loading = false,
  actions,
  emptyMessage = "لا توجد بيانات",
  onRowClick,
  className,
  headerClassName,
}: UnifiedTableProps<T>) {
  return (
    <Card className={className}>
      {(title || description || actions) && (
        <CardHeader className={cn("flex flex-row items-center justify-between", headerClassName)}>
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent>
        {loading ? (
          <TableSkeleton columns={columns.length} rows={5} />
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn("font-semibold", column.headerClassName)}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow
                    key={item.id || index}
                    className={cn(
                      onRowClick && "cursor-pointer hover:bg-muted/50"
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={column.className}
                      >
                        {column.render
                          ? column.render(item)
                          : item[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * TableSkeleton - هيكل تحميل للجدول
 */
function TableSkeleton({ columns, rows }: { columns: number; rows: number }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {[...Array(columns)].map((_, i) => (
              <TableHead key={`skeleton-head-${i}`}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(rows)].map((_, rowIndex) => (
            <TableRow key={`skeleton-row-${rowIndex}`}>
              {[...Array(columns)].map((_, colIndex) => (
                <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
