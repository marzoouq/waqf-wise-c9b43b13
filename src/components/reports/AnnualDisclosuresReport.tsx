/**
 * AnnualDisclosuresReport - تقرير الإفصاحات السنوية للإدارة
 * @description يعرض جميع الإفصاحات السنوية مع التفاصيل الكاملة
 * @version 1.0.0
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  FileText,
  Loader2,
  Wallet,
  PieChart,
  DollarSign,
  Receipt,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/lib/query-keys';
import { ErrorState } from '@/components/shared/ErrorState';
import { generateDisclosurePDF } from '@/lib/generateDisclosurePDF';
import { useDisclosureBeneficiaries } from '@/hooks/reports/useDisclosureBeneficiaries';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AnnualDisclosureDetailed {
  id: string;
  year: number;
  waqf_name: string;
  status: string;
  total_revenues: number;
  total_expenses: number;
  net_income: number;
  sons_count: number;
  daughters_count: number;
  wives_count: number;
  total_beneficiaries: number;
  nazer_share: number;
  nazer_percentage: number;
  charity_share: number;
  charity_percentage: number;
  corpus_share: number;
  corpus_percentage: number;
  administrative_expenses: number | null;
  maintenance_expenses: number | null;
  development_expenses: number | null;
  other_expenses: number | null;
  opening_balance: number | null;
  closing_balance: number | null;
  vat_amount: number | null;
  disclosure_date: string;
  created_at: string;
  published_at: string | null;
  beneficiaries_details: unknown;
  revenue_breakdown: unknown;
  expenses_breakdown: unknown;
  monthly_data: unknown;
  fiscal_years?: {
    name: string;
    start_date: string;
    end_date: string;
  };
}

const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === undefined) return '0';
  return new Intl.NumberFormat('ar-SA', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export function AnnualDisclosuresReport() {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { fetchDisclosureBeneficiaries } = useDisclosureBeneficiaries();

  const {
    data: disclosures,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...QUERY_KEYS.ANNUAL_DISCLOSURES_BENEFICIARY, 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('annual_disclosures')
        .select(
          `
          *,
          fiscal_years (
            name,
            start_date,
            end_date
          )
        `
        )
        .order('year', { ascending: false });

      if (error) throw error;
      return data as AnnualDisclosureDetailed[];
    },
  });

  const handleDownloadPDF = async (disclosure: AnnualDisclosureDetailed) => {
    setIsExporting(disclosure.id);
    try {
      const beneficiaries = await fetchDisclosureBeneficiaries(disclosure.id);
      await generateDisclosurePDF(
        disclosure as unknown as Parameters<typeof generateDisclosurePDF>[0],
        beneficiaries || [],
        null
      );
      toast.success('تم تحميل ملف PDF بنجاح');
    } catch {
      toast.error('فشل تحميل ملف PDF');
    } finally {
      setIsExporting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="خطأ في تحميل الإفصاحات"
        message={(error as Error).message}
        onRetry={refetch}
      />
    );
  }

  if (!disclosures || disclosures.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">لا توجد إفصاحات سنوية</p>
          <p className="text-sm mt-1">قم بنشر السنة المالية لإنشاء إفصاح سنوي</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ملخص عام */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{disclosures.length}</p>
              <p className="text-sm text-muted-foreground">إفصاح سنوي</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-lg font-bold text-success">
                {formatCurrency(disclosures.reduce((sum, d) => sum + d.total_revenues, 0))} ر.س
              </p>
              <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-lg font-bold text-destructive">
                {formatCurrency(disclosures.reduce((sum, d) => sum + d.total_expenses, 0))} ر.س
              </p>
              <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-chart-1/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <p className="text-lg font-bold text-chart-1">
                {formatCurrency(disclosures.reduce((sum, d) => sum + d.net_income, 0))} ر.س
              </p>
              <p className="text-sm text-muted-foreground">صافي الدخل</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الإفصاحات */}
      <Accordion type="single" collapsible className="space-y-4">
        {disclosures.map((disclosure, index) => {
          const previousYear = disclosures[index + 1] || null;
          const revenueChange = previousYear
            ? ((disclosure.total_revenues - previousYear.total_revenues) /
                previousYear.total_revenues) *
              100
            : null;

          return (
            <AccordionItem
              key={disclosure.id}
              value={disclosure.id}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full text-right">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">
                        الإفصاح السنوي {disclosure.year - 1}-{disclosure.year}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {disclosure.fiscal_years?.name || disclosure.waqf_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 me-auto sm:me-0">
                    {revenueChange !== null && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          revenueChange > 0
                            ? 'text-success border-success/30 bg-success/10'
                            : 'text-destructive border-destructive/30 bg-destructive/10'
                        )}
                      >
                        {revenueChange > 0 ? (
                          <TrendingUp className="h-3 w-3 ms-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 ms-1" />
                        )}
                        {Math.abs(revenueChange).toFixed(1)}%
                      </Badge>
                    )}
                    <Badge variant={disclosure.status === 'published' ? 'default' : 'secondary'}>
                      {disclosure.status === 'published' ? 'منشور' : 'مسودة'}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4 pt-2">
                <div className="space-y-6">
                  {/* الملخص المالي */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-success/10 rounded-lg text-center">
                      <TrendingUp className="h-4 w-4 text-success mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">الإيرادات</p>
                      <p className="text-sm font-bold text-success">
                        {formatCurrency(disclosure.total_revenues)} ر.س
                      </p>
                    </div>
                    <div className="p-3 bg-destructive/10 rounded-lg text-center">
                      <TrendingDown className="h-4 w-4 text-destructive mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">المصروفات</p>
                      <p className="text-sm font-bold text-destructive">
                        {formatCurrency(disclosure.total_expenses)} ر.س
                      </p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg text-center">
                      <Wallet className="h-4 w-4 text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">الصافي</p>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(disclosure.net_income)} ر.س
                      </p>
                    </div>
                  </div>

                  {/* تفاصيل المصروفات */}
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        تفاصيل المصروفات
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 pb-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground text-xs">إدارية</p>
                          <p className="font-semibold">
                            {formatCurrency(disclosure.administrative_expenses)} ر.س
                          </p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground text-xs">صيانة</p>
                          <p className="font-semibold">
                            {formatCurrency(disclosure.maintenance_expenses)} ر.س
                          </p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground text-xs">تطوير</p>
                          <p className="font-semibold">
                            {formatCurrency(disclosure.development_expenses)} ر.س
                          </p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground text-xs">أخرى</p>
                          <p className="font-semibold">
                            {formatCurrency(disclosure.other_expenses)} ر.س
                          </p>
                        </div>
                      </div>
                      {disclosure.vat_amount && disclosure.vat_amount > 0 && (
                        <div className="mt-2 p-2 bg-warning/10 rounded flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            ضريبة القيمة المضافة
                          </span>
                          <span className="font-semibold text-warning">
                            {formatCurrency(disclosure.vat_amount)} ر.س
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* توزيع الحصص */}
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        توزيع الحصص
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 pb-3">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="p-2 bg-chart-1/10 rounded text-center">
                          <p className="text-muted-foreground text-xs">
                            حصة الناظر ({disclosure.nazer_percentage}%)
                          </p>
                          <p className="font-semibold text-chart-1">
                            {formatCurrency(disclosure.nazer_share)} ر.س
                          </p>
                        </div>
                        <div className="p-2 bg-chart-2/10 rounded text-center">
                          <p className="text-muted-foreground text-xs">
                            الثلث الخيري ({disclosure.charity_percentage}%)
                          </p>
                          <p className="font-semibold text-chart-2">
                            {formatCurrency(disclosure.charity_share)} ر.س
                          </p>
                        </div>
                        <div className="p-2 bg-chart-3/10 rounded text-center">
                          <p className="text-muted-foreground text-xs">
                            رقبة الوقف ({disclosure.corpus_percentage}%)
                          </p>
                          <p className="font-semibold text-chart-3">
                            {formatCurrency(disclosure.corpus_share)} ر.س
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* المستفيدون */}
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        المستفيدون
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 pb-3">
                      <div className="grid grid-cols-4 gap-3 text-sm text-center">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground text-xs">الإجمالي</p>
                          <p className="font-bold text-lg">{disclosure.total_beneficiaries}</p>
                        </div>
                        <div className="p-2 bg-heir-son/10 rounded">
                          <p className="text-muted-foreground text-xs">أبناء</p>
                          <p className="font-semibold text-heir-son">{disclosure.sons_count}</p>
                        </div>
                        <div className="p-2 bg-heir-daughter/10 rounded">
                          <p className="text-muted-foreground text-xs">بنات</p>
                          <p className="font-semibold text-heir-daughter">
                            {disclosure.daughters_count}
                          </p>
                        </div>
                        <div className="p-2 bg-heir-wife/10 rounded">
                          <p className="text-muted-foreground text-xs">زوجات</p>
                          <p className="font-semibold text-heir-wife">{disclosure.wives_count}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* الأرصدة */}
                  {(disclosure.opening_balance || disclosure.closing_balance) && (
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          الأرصدة
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-0 pb-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="p-2 bg-muted/50 rounded flex justify-between">
                            <span className="text-muted-foreground">الرصيد الافتتاحي</span>
                            <span className="font-semibold">
                              {formatCurrency(disclosure.opening_balance)} ر.س
                            </span>
                          </div>
                          <div className="p-2 bg-primary/10 rounded flex justify-between">
                            <span className="text-muted-foreground">الرصيد الختامي</span>
                            <span className="font-semibold text-primary">
                              {formatCurrency(disclosure.closing_balance)} ر.س
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* معلومات النشر */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>تاريخ الإفصاح: {formatDate(disclosure.disclosure_date)}</span>
                      {disclosure.published_at && (
                        <span>تاريخ النشر: {formatDate(disclosure.published_at)}</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(disclosure)}
                      disabled={isExporting === disclosure.id}
                    >
                      {isExporting === disclosure.id ? (
                        <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 ms-2" />
                      )}
                      تحميل PDF
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
