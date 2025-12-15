/**
 * Historical Rental Monthly Summary Table
 * جدول الملخص الشهري للإيجارات التاريخية
 * @version 2.8.76
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle, Home } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { HistoricalRentalMonthlySummary } from '@/services/historical-rental.service';

interface HistoricalRentalMonthlyTableProps {
  monthlySummary: HistoricalRentalMonthlySummary[];
  onMonthClick: (monthDate: string) => void;
}

export function HistoricalRentalMonthlyTable({ 
  monthlySummary,
  onMonthClick
}: HistoricalRentalMonthlyTableProps) {
  const formatMonthLabel = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMMM yyyy', { locale: ar });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {monthlySummary.map((month) => (
          <div
            key={month.month_date}
            className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onMonthClick(month.month_date)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">{formatMonthLabel(month.month_date)}</span>
              <Badge variant="outline" className="text-xs">{month.total_units} وحدة</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs mb-2">
              <span className="flex items-center gap-1 text-success">
                <CheckCircle className="h-3 w-3" />
                {month.paid_count} مدفوع
              </span>
              {Number(month.unpaid_count) > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="h-3 w-3" />
                  {month.unpaid_count}
                </span>
              )}
              {Number(month.vacant_count) > 0 && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Home className="h-3 w-3" />
                  {month.vacant_count}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">المحصّل</span>
              <span className="font-bold text-success text-sm">
                {formatCurrency(Number(month.paid_amount))}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الشهر</TableHead>
              <TableHead className="text-center">الوحدات</TableHead>
              <TableHead className="text-center">
                <span className="flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3 text-success" />
                  مدفوع
                </span>
              </TableHead>
              <TableHead className="text-center">
                <span className="flex items-center justify-center gap-1">
                  <XCircle className="h-3 w-3 text-destructive" />
                  غير مدفوع
                </span>
              </TableHead>
              <TableHead className="text-center">
                <span className="flex items-center justify-center gap-1">
                  <Home className="h-3 w-3 text-muted-foreground" />
                  شاغر
                </span>
              </TableHead>
              <TableHead className="text-left">المحصّل</TableHead>
              <TableHead className="text-center">الإجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlySummary.map((month) => (
              <TableRow 
                key={month.month_date}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onMonthClick(month.month_date)}
              >
                <TableCell className="font-medium">
                  {formatMonthLabel(month.month_date)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{month.total_units}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="default" className="bg-success/20 text-success hover:bg-success/30">
                    {month.paid_count}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {Number(month.unpaid_count) > 0 ? (
                    <Badge variant="destructive">{month.unpaid_count}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {Number(month.vacant_count) > 0 ? (
                    <Badge variant="secondary">{month.vacant_count}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-left font-semibold text-success">
                  {formatCurrency(Number(month.paid_amount))}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMonthClick(month.month_date);
                    }}
                  >
                    <Eye className="h-4 w-4 ms-1" />
                    التفاصيل
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
