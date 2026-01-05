/**
 * DisclosureDetailsTab - صفحة كاملة لعرض تفاصيل الإفصاح السنوي
 * @version 1.1.0
 * - إصلاح مشكلة الطباعة: إضافة أنماط print للمكونات
 */

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  Calculator,
  ArrowRight,
  Download,
  Printer,
  Loader2,
  Wallet,
  ArrowDown,
  CheckCircle2,
  Percent
} from "lucide-react";
import { useAnnualDisclosures, AnnualDisclosure } from "@/hooks/reports/useAnnualDisclosures";
import { generateDisclosurePDF } from "@/lib/generateDisclosurePDF";
import { useDisclosureBeneficiaries } from "@/hooks/reports/useDisclosureBeneficiaries";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/ErrorState";
import { SmartDisclosureDocuments } from "@/components/reports/SmartDisclosureDocuments";
import { HistoricalRentalDetailsCard } from "@/components/fiscal-years";
import { YearComparisonCard } from "@/components/disclosure/YearComparisonCard";
import { DisclosureCharts } from "@/components/disclosure/DisclosureCharts";
import { SmartInsights } from "@/components/disclosure/SmartInsights";
import { PrintableDisclosureContent } from "./PrintableDisclosureContent";
import { QUERY_KEYS } from "@/lib/query-keys";
import { DisclosureService } from "@/services/disclosure.service";
import { HistoricalRentalService } from "@/services/historical-rental.service";
import { HISTORICAL_RENTAL_QUERY_KEY } from "@/hooks/fiscal-years/useHistoricalRentalDetails";

interface ExpenseItem {
  name: string;
  amount: number;
}

interface RevenueItem {
  name: string;
  amount: number;
}

interface BeneficiariesDetails {
  distributions?: {
    total: number;
    sons_share: number;
    daughters_share: number;
    wives_share: number;
    heirs_count: number;
    sons_count?: number;
    daughters_count?: number;
    wives_count?: number;
  };
}

// ترجمة أسماء المصروفات
const expenseNameTranslations: Record<string, string> = {
  'audit_2024': 'تدقيق 2024',
  'audit_2025': 'تدقيق 2025',
  'cleaning_worker': 'عامل نظافة',
  'ejar_platform': 'منصة إيجار',
  'electrical_works': 'أعمال كهربائية',
  'electricity_bills': 'فواتير الكهرباء',
  'electricity_maintenance': 'صيانة كهربائية',
  'gypsum_works': 'أعمال جبس',
  'miscellaneous': 'مصروفات متنوعة',
  'plumbing_maintenance': 'صيانة سباكة',
  'plumbing_works': 'أعمال سباكة',
  'rental_commission': 'عمولة إيجار',
  'water_bills': 'فواتير المياه',
  'zakat': 'الزكاة',
  'maintenance': 'مصروفات الصيانة',
  'administrative': 'مصروفات إدارية',
  'development': 'مصروفات التطوير',
  'other': 'مصروفات أخرى',
};

// ترجمة أسماء الإيرادات
const revenueNameTranslations: Record<string, string> = {
  'jeddah_properties': 'عقارات جدة',
  'nahdi_rental': 'إيجار النهدي',
  'remaining_2024': 'متبقي 2024',
  'residential_monthly': 'الإيجارات السكنية الشهرية',
  'rental_income': 'إيرادات الإيجار',
  'investment_returns': 'عوائد الاستثمار',
  'other_income': 'إيرادات أخرى',
};

const translateExpenseName = (name: string): string => {
  return expenseNameTranslations[name.toLowerCase().trim()] || name;
};

const translateRevenueName = (name: string): string => {
  return revenueNameTranslations[name.toLowerCase().trim()] || name;
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "0 ر.س";
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export function DisclosureDetailsTab() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const disclosureId = searchParams.get("id");
  const { disclosures, isLoading } = useAnnualDisclosures();
  const { fetchDisclosureBeneficiaries } = useDisclosureBeneficiaries();
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const disclosure = disclosures?.find(d => d.id === disclosureId);
  const previousYear = disclosures?.find(d => d.year === (disclosure?.year || 0) - 1) || null;

  const handleBack = () => {
    navigate("/beneficiary-portal?tab=disclosures");
  };

  const handleExportPDF = async () => {
    if (!disclosure) return;
    setIsExporting(true);
    try {
      const beneficiaries = await fetchDisclosureBeneficiaries(disclosure.id);
      await generateDisclosurePDF(disclosure, beneficiaries || []);
      toast.success("تم تحميل ملف PDF بنجاح");
    } catch (error) {
      toast.error("فشل تحميل ملف PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const queryClient = useQueryClient();

  const handlePrint = async () => {
    if (!disclosure) return;
    setIsPrinting(true);

    try {
      // 1) Prefetch supporting documents so print won't capture a "loading" state
      await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.SMART_DISCLOSURE_DOCUMENTS(disclosure.id),
        queryFn: () => DisclosureService.getSmartDocuments(disclosure.id),
      });

      // 2) Prefetch historical rental summary (if linked)
      if (disclosure.fiscal_year_id) {
        const closingId = await HistoricalRentalService.getClosingIdByFiscalYear(disclosure.fiscal_year_id);
        if (closingId) {
          await queryClient.prefetchQuery({
            queryKey: [...HISTORICAL_RENTAL_QUERY_KEY, 'monthly-summary', closingId],
            queryFn: () => HistoricalRentalService.getMonthlySummary(closingId),
          });
        }
      }

      // Give the DOM one tick to render the print-only blocks
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!disclosure) {
    return (
      <ErrorState 
        title="خطأ في تحميل الإفصاح" 
        message="لم يتم العثور على الإفصاح المطلوب" 
        onRetry={handleBack}
      />
    );
  }

  // Parse expense breakdown
  const expensesBreakdown = disclosure.expenses_breakdown as Record<string, number> | null;
  const expenseItems: ExpenseItem[] = expensesBreakdown 
    ? Object.entries(expensesBreakdown)
        .filter(([name]) => name.toLowerCase() !== 'total')
        .map(([name, amount]) => ({ name, amount: amount || 0 }))
    : [];

  // Parse revenue breakdown
  const revenueBreakdown = disclosure.revenue_breakdown as Record<string, number> | null;
  const revenueItems: RevenueItem[] = revenueBreakdown
    ? Object.entries(revenueBreakdown)
        .filter(([name]) => name.toLowerCase() !== 'total')
        .map(([name, amount]) => ({ name, amount: amount || 0 }))
    : [];

  // Parse beneficiaries details
  const beneficiariesDetails = disclosure.beneficiaries_details as BeneficiariesDetails | null;
  const distributions = beneficiariesDetails?.distributions;

  // Calculate key figures
  const totalRevenues = disclosure.total_revenues || 0;
  const totalExpenses = disclosure.total_expenses || 0;
  const vatAmount = disclosure.vat_amount || 0;
  const nazerShare = disclosure.nazer_share || 0;
  const charityShare = disclosure.charity_share || 0;
  const corpusShare = disclosure.corpus_share || 0;
  const distributedAmount = distributions?.total || 0;
  const netAfterExpenses = totalRevenues - totalExpenses;
  const totalDeductions = vatAmount + nazerShare + charityShare;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* محتوى الطباعة المُحسّن */}
      <PrintableDisclosureContent disclosure={disclosure} previousYear={previousYear} />

      {/* Header - مخفي عند الطباعة */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowRight className="h-4 w-4 ms-2" />
            رجوع
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              الإفصاح السنوي {disclosure.year - 1}-{disclosure.year}
            </h1>
            <p className="text-sm text-muted-foreground">{disclosure.waqf_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={isPrinting}
            className="gap-2"
          >
            {isPrinting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            طباعة
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            تصدير PDF
          </Button>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {disclosure.status === 'published' ? 'منشور' : 'مسودة'}
          </Badge>
        </div>
      </div>

      {/* الرؤى الذكية والمقارنة - مخفية عند الطباعة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:hidden">
        <SmartInsights currentYear={disclosure} previousYear={previousYear} />
        <YearComparisonCard currentYear={disclosure} previousYear={previousYear} />
      </div>

      {/* الرسوم البيانية - مخفية عند الطباعة لأنها لا تعمل */}
      <div className="print:hidden">
        <DisclosureCharts disclosure={disclosure} />
      </div>

      {/* الكشف المالي المتسلسل - مخفي عند الطباعة */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30 print:hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            الكشف المالي المتسلسل
          </CardTitle>
          <CardDescription>
            رحلة الأموال من الإيرادات إلى المتبقي (رقبة الوقف)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* إجمالي الإيرادات */}
          <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/20 rounded-full">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-semibold text-lg">إجمالي الإيرادات</p>
                <p className="text-sm text-muted-foreground">جميع مصادر الدخل للسنة المالية</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-success">{formatCurrency(totalRevenues)}</p>
          </div>

          <div className="flex justify-center"><ArrowDown className="h-6 w-6 text-muted-foreground" /></div>

          {/* إجمالي المصروفات */}
          <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/20 rounded-full">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-lg">إجمالي المصروفات</p>
                <p className="text-sm text-muted-foreground">صيانة وإدارية وتشغيلية</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-destructive">({formatCurrency(totalExpenses)})</p>
          </div>

          <div className="flex justify-center"><ArrowDown className="h-6 w-6 text-muted-foreground" /></div>

          {/* صافي الدخل */}
          <div className="flex items-center justify-between p-4 bg-info/10 rounded-lg border border-info/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/20 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="font-semibold text-lg">صافي الدخل قبل الاستقطاعات</p>
                <p className="text-sm text-muted-foreground">الإيرادات - المصروفات</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-info">{formatCurrency(netAfterExpenses)}</p>
          </div>

          <div className="flex justify-center"><ArrowDown className="h-6 w-6 text-muted-foreground" /></div>

          {/* التوزيعات */}
          <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/20 rounded-full">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="font-semibold text-lg">توزيعات الورثة</p>
                <p className="text-sm text-muted-foreground">المبالغ الموزعة على المستفيدين</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-warning">({formatCurrency(distributedAmount)})</p>
          </div>

          <div className="flex justify-center"><ArrowDown className="h-6 w-6 text-muted-foreground" /></div>

          {/* رقبة الوقف */}
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">رقبة الوقف (المتبقي)</p>
                <p className="text-sm text-muted-foreground">للحفاظ على أصل الوقف</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(corpusShare)}</p>
          </div>
        </CardContent>
      </Card>

      {/* تفصيل الإيرادات والمصروفات - مخفي عند الطباعة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:hidden">
        {/* الإيرادات */}
        {revenueItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                تفصيل الإيرادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المصدر</TableHead>
                    <TableHead className="text-left">المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueItems.map((item) => (
                    <TableRow key={`revenue-${item.name}`}>
                      <TableCell className="font-medium">{translateRevenueName(item.name)}</TableCell>
                      <TableCell className="text-success">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">الإجمالي</TableCell>
                    <TableCell className="font-bold text-success">{formatCurrency(totalRevenues)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* المصروفات */}
        {expenseItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                تفصيل المصروفات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">البند</TableHead>
                    <TableHead className="text-left">المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseItems.map((item) => (
                    <TableRow key={`expense-${item.name}`}>
                      <TableCell className="font-medium">{translateExpenseName(item.name)}</TableCell>
                      <TableCell className="text-destructive">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">الإجمالي</TableCell>
                    <TableCell className="font-bold text-destructive">{formatCurrency(totalExpenses)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* توزيعات الورثة - مخفي عند الطباعة */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-warning" />
            توزيعات الورثة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-heir-son/10 rounded-lg">
              <p className="text-sm text-muted-foreground">الأبناء</p>
              <p className="text-2xl font-bold text-heir-son">{disclosure.sons_count}</p>
              {distributions?.sons_share && (
                <p className="text-sm text-muted-foreground mt-1">{formatCurrency(distributions.sons_share)}</p>
              )}
            </div>
            <div className="text-center p-4 bg-heir-daughter/10 rounded-lg">
              <p className="text-sm text-muted-foreground">البنات</p>
              <p className="text-2xl font-bold text-heir-daughter">{disclosure.daughters_count}</p>
              {distributions?.daughters_share && (
                <p className="text-sm text-muted-foreground mt-1">{formatCurrency(distributions.daughters_share)}</p>
              )}
            </div>
            <div className="text-center p-4 bg-heir-wife/10 rounded-lg">
              <p className="text-sm text-muted-foreground">الزوجات</p>
              <p className="text-2xl font-bold text-heir-wife">{disclosure.wives_count}</p>
              {distributions?.wives_share && (
                <p className="text-sm text-muted-foreground mt-1">{formatCurrency(distributions.wives_share)}</p>
              )}
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">الإجمالي</p>
              <p className="text-2xl font-bold text-primary">{disclosure.total_beneficiaries}</p>
              {distributions?.total && (
                <p className="text-sm text-muted-foreground mt-1">{formatCurrency(distributions.total)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نسب التوزيع - مخفي عند الطباعة */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            نسب التوزيع المعتمدة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-nazer/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">حصة الناظر</p>
              <p className="text-2xl font-bold text-nazer">{disclosure.nazer_percentage}%</p>
              <p className="text-sm text-muted-foreground mt-1">{formatCurrency(nazerShare)}</p>
            </div>
            <div className="p-4 bg-charity/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">صدقة الواقف</p>
              <p className="text-2xl font-bold text-charity">{disclosure.charity_percentage}%</p>
              <p className="text-sm text-muted-foreground mt-1">{formatCurrency(charityShare)}</p>
            </div>
            <div className="p-4 bg-corpus/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">رأس مال الوقف</p>
              <p className="text-2xl font-bold text-corpus">{disclosure.corpus_percentage}%</p>
              <p className="text-sm text-muted-foreground mt-1">{formatCurrency(corpusShare)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تفاصيل العقارات - مخفي عند الطباعة */}
      <div className="print:hidden">
        {disclosure.fiscal_year_id && (
          <HistoricalRentalDetailsCard 
            fiscalYearId={disclosure.fiscal_year_id} 
            fiscalYearName={`${disclosure.year - 1}-${disclosure.year}`}
          />
        )}
      </div>

      {/* المستندات - مخفي عند الطباعة */}
      <div className="print:hidden">
        <SmartDisclosureDocuments disclosureId={disclosure.id} />
      </div>
    </div>
  );
}
