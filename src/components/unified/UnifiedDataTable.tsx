import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { MobileScrollHint } from "@/components/shared/MobileScrollHint";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Column definition for UnifiedDataTable with improved type safety for row parameter */
export interface Column<T = Record<string, unknown>> {
  key: string;
  label: string | ReactNode;
  /** Render function receives the cell value and the typed row */
  render?: (value: ReactNode, row: T) => ReactNode;
  align?: "right" | "left" | "center";
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  className?: string;
  width?: number | string;
}

interface UnifiedDataTableProps<T = Record<string, unknown>> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  actions?: (row: T) => ReactNode;
  showMobileScrollHint?: boolean;
  /** Enable virtualization for large lists (100+ items) */
  virtualized?: boolean;
  /** Max height for virtualized list in pixels */
  virtualMaxHeight?: number;
  /** Row height for virtualization in pixels */
  rowHeight?: number;
}

/**
 * UnifiedDataTable - جدول بيانات موحد متقدم
 * بتصميم متسق مع دعم الترقيم، الإجراءات، والتوافق مع الموبايل
 * v2.9.35 - إضافة دعم Virtualization للقوائم الكبيرة
 */
export function UnifiedDataTable<T extends { id?: string }>({
  title,
  columns, 
  data,
  loading = false,
  emptyMessage = "لا توجد بيانات",
  pagination,
  actions,
  showMobileScrollHint = true,
  virtualized = false,
  virtualMaxHeight = 500,
  rowHeight = 48,
}: UnifiedDataTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Auto-enable virtualization for large datasets
  const shouldVirtualize = virtualized || data.length > 100;
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
    enabled: shouldVirtualize,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  // Helper to get responsive classes
  const getColumnClasses = (column: Column<T>) => {
    const classes = ["text-right", "font-semibold", "whitespace-nowrap", "text-xs", "sm:text-sm"];
    if (column.hideOnMobile) classes.push("hidden", "md:table-cell");
    if (column.hideOnTablet) classes.push("hidden", "lg:table-cell");
    if (column.align === "center") classes.push("text-center");
    return classes.join(" ");
  };

  const getCellClasses = (column: Column<T>) => {
    const classes = ["text-xs", "sm:text-sm"];
    if (column.hideOnMobile) classes.push("hidden", "md:table-cell");
    if (column.hideOnTablet) classes.push("hidden", "lg:table-cell");
    if (column.align === "center") classes.push("text-center");
    return classes.join(" ");
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        {title && (
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render virtualized table for large datasets
  const renderVirtualizedTable = () => (
    <div className="rounded-md overflow-hidden">
      {/* Fixed header */}
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow className="bg-muted/30">
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className={getColumnClasses(column)}
                style={{ width: column.width }}
              >
                {column.label}
              </TableHead>
            ))}
            {actions && (
              <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm">
                الإجراءات
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
      </Table>

      {/* Virtualized body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ maxHeight: virtualMaxHeight }}
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
                return (
                  <TableRow
                    key={row.id || `row-${virtualRow.index}`}
                    className="hover:bg-muted/50 transition-colors"
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
                    {columns.map((column) => {
                      const value = (row as Record<string, unknown>)[column.key];
                      return (
                        <TableCell 
                          key={column.key}
                          className={getCellClasses(column)}
                          style={{ width: column.width }}
                        >
                          {column.render 
                            ? column.render(value as ReactNode, row)
                            : String(value ?? '')
                          }
                        </TableCell>
                      );
                    })}
                    {actions && (
                      <TableCell>
                        {actions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Row count indicator */}
      <div className="px-3 py-2 text-xs text-muted-foreground border-t bg-muted/30">
        إجمالي السجلات: {data.length.toLocaleString('ar-SA')}
      </div>
    </div>
  );

  // Render regular table for small datasets
  const renderRegularTable = () => (
    <>
      <ScrollableTableWrapper>
        <div className="min-w-max">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                {columns.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={getColumnClasses(column)}
                  >
                    {column.label}
                  </TableHead>
                ))}
                {actions && (
                  <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm">
                    الإجراءات
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id || JSON.stringify(row)} className="hover:bg-muted/50 transition-colors">
                  {columns.map((column) => {
                    const value = (row as Record<string, unknown>)[column.key];
                    return (
                      <TableCell 
                        key={column.key}
                        className={getCellClasses(column)}
                      >
                        {column.render 
                          ? column.render(value as ReactNode, row)
                          : String(value ?? '')
                        }
                      </TableCell>
                    );
                  })}
                  {actions && (
                    <TableCell>
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollableTableWrapper>

      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            itemsPerPage={pagination.itemsPerPage}
            totalItems={pagination.totalItems}
          />
        </div>
      )}
    </>
  );

  return (
    <Card className="shadow-soft">
      {title && (
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {showMobileScrollHint && !shouldVirtualize && <MobileScrollHint />}
        
        {data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : shouldVirtualize ? (
          renderVirtualizedTable()
        ) : (
          renderRegularTable()
        )}
      </CardContent>
    </Card>
  );
}
