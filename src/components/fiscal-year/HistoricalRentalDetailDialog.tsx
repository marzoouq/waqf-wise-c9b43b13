/**
 * Historical Rental Detail Dialog
 * محاورة تفاصيل إيجارات شهر محدد
 * @version 2.8.76
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, CheckCircle, XCircle, Home, Loader2 } from 'lucide-react';
import { useHistoricalRentalByMonth } from '@/hooks/fiscal-years/useHistoricalRentalDetails';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { HistoricalRentalMonthlySummary } from '@/services/historical-rental.service';

interface HistoricalRentalDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fiscalYearClosingId: string;
  monthDate: string;
  monthlySummary?: HistoricalRentalMonthlySummary;
}

export function HistoricalRentalDetailDialog({
  open,
  onOpenChange,
  fiscalYearClosingId,
  monthDate,
  monthlySummary,
}: HistoricalRentalDetailDialogProps) {
  const { data: details, isLoading } = useHistoricalRentalByMonth(
    fiscalYearClosingId,
    monthDate
  );

  const formatMonthLabel = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMMM yyyy', { locale: ar });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-success/20 text-success hover:bg-success/30">
            <CheckCircle className="h-3 w-3 ml-1" />
            مدفوع
          </Badge>
        );
      case 'unpaid':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 ml-1" />
            غير مدفوع
          </Badge>
        );
      case 'vacant':
        return (
          <Badge variant="secondary">
            <Home className="h-3 w-3 ml-1" />
            شاغر
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            تفاصيل إيجارات {monthDate ? formatMonthLabel(monthDate) : ''}
          </DialogTitle>
          {monthlySummary && (
            <DialogDescription className="flex items-center gap-4 pt-2">
              <span className="flex items-center gap-1">
                <Badge variant="outline">{monthlySummary.total_units} وحدة</Badge>
              </span>
              <span className="flex items-center gap-1 text-success">
                <CheckCircle className="h-3 w-3" />
                {monthlySummary.paid_count} مدفوع
              </span>
              {Number(monthlySummary.unpaid_count) > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="h-3 w-3" />
                  {monthlySummary.unpaid_count} غير مدفوع
                </span>
              )}
              {Number(monthlySummary.vacant_count) > 0 && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Home className="h-3 w-3" />
                  {monthlySummary.vacant_count} شاغر
                </span>
              )}
              <span className="mr-auto font-semibold text-success">
                المحصّل: {formatCurrency(Number(monthlySummary.paid_amount))}
              </span>
            </DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : details && details.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">العقار</TableHead>
                    <TableHead className="text-center">الوحدة</TableHead>
                    <TableHead className="text-center">الدور</TableHead>
                    <TableHead className="text-right">المستأجر</TableHead>
                    <TableHead className="text-left">الإيجار الشهري</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell className="font-medium">
                        {detail.property_name || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{detail.unit_number || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {detail.floor_number || '-'}
                      </TableCell>
                      <TableCell>{detail.tenant_name}</TableCell>
                      <TableCell className="text-left font-semibold">
                        {detail.payment_status === 'vacant' 
                          ? '-' 
                          : formatCurrency(detail.monthly_payment)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(detail.payment_status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد بيانات لهذا الشهر
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
