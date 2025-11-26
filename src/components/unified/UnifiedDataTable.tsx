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

export interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  align?: "right" | "left" | "center";
  hideOnMobile?: boolean; // مخفي على الموبايل
  hideOnTablet?: boolean; // مخفي على التابلت
  className?: string; // إضافة className للتخصيص
}

interface UnifiedDataTableProps<T> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  // Actions menu for each row
  actions?: (row: T) => ReactNode;
  // Mobile scroll hint
  showMobileScrollHint?: boolean;
}

/**
 * UnifiedDataTable - جدول بيانات موحد متقدم
 * بتصميم متسق مع دعم الترقيم، الإجراءات، والتوافق مع الموبايل
 */
export function UnifiedDataTable<T extends Record<string, any>>({ 
  title,
  columns, 
  data,
  loading = false,
  emptyMessage = "لا توجد بيانات",
  pagination,
  actions,
  showMobileScrollHint = true
}: UnifiedDataTableProps<T>) {
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

  return (
    <Card className="shadow-soft">
      {title && (
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {showMobileScrollHint && <MobileScrollHint />}
        
        {data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
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
                    {data.map((row, index) => (
                      <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                        {columns.map((column) => (
                          <TableCell 
                            key={column.key}
                            className={getCellClasses(column)}
                          >
                            {column.render 
                              ? column.render(row[column.key], row)
                              : row[column.key]
                            }
                          </TableCell>
                        ))}
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
        )}
      </CardContent>
    </Card>
  );
}
