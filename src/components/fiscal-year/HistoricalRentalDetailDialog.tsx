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
import { Building2, CheckCircle, XCircle, Home, Loader2, FileText, Calendar } from 'lucide-react';
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
            <CheckCircle className="h-3 w-3 ms-1" />
            مدفوع
          </Badge>
        );
      case 'unpaid':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 ms-1" />
            غير مدفوع
          </Badge>
        );
      case 'vacant':
        return (
          <Badge variant="secondary">
            <Home className="h-3 w-3 ms-1" />
            شاغر
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl lg:max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            تفاصيل إيجارات {monthDate ? formatMonthLabel(monthDate) : ''}
          </DialogTitle>
          {monthlySummary && (
            <DialogDescription className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2">
              <Badge variant="outline" className="text-xs">{monthlySummary.total_units} وحدة</Badge>
              <span className="flex items-center gap-1 text-success text-xs sm:text-sm">
                <CheckCircle className="h-3 w-3" />
                {monthlySummary.paid_count} مدفوع
              </span>
              {Number(monthlySummary.unpaid_count) > 0 && (
                <span className="flex items-center gap-1 text-destructive text-xs sm:text-sm">
                  <XCircle className="h-3 w-3" />
                  {monthlySummary.unpaid_count} غير مدفوع
                </span>
              )}
              {Number(monthlySummary.vacant_count) > 0 && (
                <span className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm">
                  <Home className="h-3 w-3" />
                  {monthlySummary.vacant_count} شاغر
                </span>
              )}
              <span className="w-full sm:w-auto sm:mr-auto font-semibold text-success text-sm mt-2 sm:mt-0">
                المحصّل: {formatCurrency(Number(monthlySummary.paid_amount))}
              </span>
            </DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] px-4 sm:px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : details && details.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3 pb-4">
                {details.map((detail) => (
                  <div key={detail.id} className="border rounded-lg p-3 space-y-2 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{detail.tenant_name}</span>
                      {getStatusBadge(detail.payment_status)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">الوحدة:</span>
                        <Badge variant="outline" className="me-1">{detail.unit_number || '-'}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">الدور:</span>
                        <span className="me-1">{detail.floor_number || '-'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">الدفعة الشهرية</span>
                      <span className="font-bold text-success">
                        {detail.payment_status === 'vacant' ? '-' : formatCurrency(detail.monthly_payment)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">الوحدة</TableHead>
                      <TableHead className="text-center">الدور</TableHead>
                      <TableHead className="text-right">المستأجر</TableHead>
                      <TableHead className="text-left">الدفعة</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                      <TableHead className="text-right hidden lg:table-cell">رقم العقد</TableHead>
                      <TableHead className="text-left hidden lg:table-cell">قيمة العقد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell className="text-center">
                          <Badge variant="outline">{detail.unit_number || '-'}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {detail.floor_number || '-'}
                        </TableCell>
                        <TableCell className="font-medium">{detail.tenant_name}</TableCell>
                        <TableCell className="text-left font-semibold">
                          {detail.payment_status === 'vacant' 
                            ? '-' 
                            : formatCurrency(detail.monthly_payment)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(detail.payment_status)}
                        </TableCell>
                        <TableCell className="font-mono text-xs hidden lg:table-cell">
                          {detail.contract_number || '-'}
                        </TableCell>
                        <TableCell className="text-left text-xs hidden lg:table-cell">
                          {detail.annual_contract_value 
                            ? formatCurrency(detail.annual_contract_value)
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
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
