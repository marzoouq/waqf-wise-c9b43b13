/**
 * Historical Rental Details Card
 * بطاقة تفاصيل الإيجارات التاريخية
 * @version 2.9.24
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { useHistoricalRentalMonthlySummary } from '@/hooks/fiscal-years/useHistoricalRentalDetails';
import { HistoricalRentalMonthlyTable } from './HistoricalRentalMonthlyTable';
import { HistoricalRentalDetailDialog } from './HistoricalRentalDetailDialog';
import { formatCurrency } from '@/lib/utils';
import { HistoricalRentalService } from '@/services/historical-rental.service';

interface HistoricalRentalDetailsCardProps {
  fiscalYearId?: string;
  fiscalYearName?: string;
}

export function HistoricalRentalDetailsCard({ 
  fiscalYearId,
  fiscalYearName 
}: HistoricalRentalDetailsCardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  
  useEffect(() => {
    if (fiscalYearId) {
      HistoricalRentalService.getClosingIdByFiscalYear(fiscalYearId).then(setClosingId);
    }
  }, [fiscalYearId]);
  
  const { monthlySummary, isLoading } = useHistoricalRentalMonthlySummary(closingId || undefined);

  // حساب الإجماليات
  const totalCollected = monthlySummary.reduce((sum, m) => sum + Number(m.paid_amount || 0), 0);
  const totalMonths = monthlySummary.length;
  const avgMonthly = totalMonths > 0 ? totalCollected / totalMonths : 0;

  if (!fiscalYearId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            تفاصيل الإيرادات السكنية التاريخية
          </CardTitle>
          <CardDescription>
            لا توجد سنة مالية مغلقة لعرض تفاصيلها
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-muted-foreground">جاري تحميل البيانات...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (monthlySummary.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            تفاصيل الإيرادات السكنية التاريخية
          </CardTitle>
          <CardDescription>
            لم يتم إدخال تفاصيل الإيجارات لهذه السنة المالية بعد
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            تفاصيل الإيرادات السكنية التاريخية
            {fiscalYearName && (
              <span className="text-sm font-normal text-muted-foreground">
                - {fiscalYearName}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            انقر على أي شهر لعرض تفاصيل كل شقة ومستأجر
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ملخص الإجماليات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-success/10 rounded-lg p-4 border border-success/20">
              <div className="flex items-center gap-2 text-success mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">إجمالي المحصّل</span>
              </div>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(totalCollected)}
              </div>
            </div>
            
            <div className="bg-info/10 rounded-lg p-4 border border-info/20">
              <div className="flex items-center gap-2 text-info mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">عدد الأشهر</span>
              </div>
              <div className="text-2xl font-bold text-info">
                {totalMonths} شهر
              </div>
            </div>
            
            <div className="bg-warning/10 rounded-lg p-4 border border-warning/20">
              <div className="flex items-center gap-2 text-warning mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">متوسط الشهر</span>
              </div>
              <div className="text-2xl font-bold text-warning">
                {formatCurrency(avgMonthly)}
              </div>
            </div>
          </div>

          {/* جدول الملخص الشهري */}
          <HistoricalRentalMonthlyTable 
            monthlySummary={monthlySummary}
            onMonthClick={(monthDate) => setSelectedMonth(monthDate)}
          />
        </CardContent>
      </Card>

      {/* Dialog تفاصيل الشهر */}
      <HistoricalRentalDetailDialog
        open={!!selectedMonth}
        onOpenChange={(open) => !open && setSelectedMonth(null)}
        fiscalYearClosingId={closingId || ''}
        monthDate={selectedMonth || ''}
        monthlySummary={monthlySummary.find(m => m.month_date === selectedMonth)}
      />
    </>
  );
}
