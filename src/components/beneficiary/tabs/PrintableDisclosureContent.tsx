/**
 * PrintableDisclosureContent - محتوى الطباعة للإفصاح السنوي
 * @description مكون مُحسّن للطباعة يعرض جميع تفاصيل الإفصاح
 * @version 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
import { AnnualDisclosure } from "@/hooks/reports/useAnnualDisclosures";
import { useSmartDisclosureDocuments } from "@/hooks/reports/useSmartDisclosureDocuments";
import { HistoricalRentalService } from "@/services/historical-rental.service";
import { HISTORICAL_RENTAL_QUERY_KEY } from "@/hooks/fiscal-years/useHistoricalRentalDetails";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calculator,
  Building2,
  Wallet,
  ArrowDown,
  CheckCircle2,
  Percent,
  BarChart3,
  FileText
} from "lucide-react";

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
  };
}

interface PrintableDisclosureContentProps {
  disclosure: AnnualDisclosure;
  previousYear?: AnnualDisclosure | null;
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

const calculateChange = (current: number, previous: number): { value: number; isPositive: boolean | null } => {
  if (previous === 0) return { value: 0, isPositive: null };
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change),
    isPositive: change > 0 ? true : change < 0 ? false : null,
  };
};

export function PrintableDisclosureContent({ disclosure, previousYear }: PrintableDisclosureContentProps) {
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
  const nazerShare = disclosure.nazer_share || 0;
  const charityShare = disclosure.charity_share || 0;
  const corpusShare = disclosure.corpus_share || 0;
  const distributedAmount = distributions?.total || 0;
  const netAfterExpenses = totalRevenues - totalExpenses;

  // Supporting documents (printable)
  const { documents, categorySummary } = useSmartDisclosureDocuments(disclosure.id);

  // Historical rental summary (printable)
  const fiscalYearId = disclosure.fiscal_year_id || undefined;
  const { data: closingId } = useQuery({
    queryKey: ['fiscal-year-closing-id', fiscalYearId],
    queryFn: () => HistoricalRentalService.getClosingIdByFiscalYear(fiscalYearId!),
    enabled: !!fiscalYearId,
  });

  const { data: monthlySummary = [] } = useQuery({
    queryKey: [...HISTORICAL_RENTAL_QUERY_KEY, 'monthly-summary', closingId],
    queryFn: () => HistoricalRentalService.getMonthlySummary(closingId!),
    enabled: !!closingId,
  });

  const totalCollected = monthlySummary.reduce((sum, m) => sum + Number(m.paid_amount || 0), 0);

  return (
    <div className="hidden print:block print-content p-4" style={{ overflow: 'visible', height: 'auto' }}>
      <style>{`
        @media print {
          .print-content {
            display: block !important;
            visibility: visible !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
          }
          .print-content * {
            visibility: visible !important;
          }
          .print-section {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: auto;
          }
          .print-table th, .print-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }
          .print-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .print-table tr {
            page-break-inside: avoid;
          }
          .print-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .print-card-header {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .print-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .print-grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          .print-grid-4 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }
          .print-stat-box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            break-inside: avoid;
          }
          .print-flow-item {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .print-page-break {
            page-break-before: always;
          }
          .text-success { color: #16a34a; }
          .text-destructive { color: #dc2626; }
          .text-warning { color: #d97706; }
          .text-primary { color: #2563eb; }
          .text-info { color: #0891b2; }
        }
      `}</style>

      {/* عنوان الطباعة */}
      <div className="text-center mb-8 print-section">
        <h1 className="text-2xl font-bold mb-2">الإفصاح السنوي {disclosure.year - 1}-{disclosure.year}</h1>
        <p className="text-muted-foreground">{disclosure.waqf_name}</p>
        <p className="text-sm text-muted-foreground mt-1">تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</p>
      </div>

      {/* التوزيع البصري - نسخة مبسطة للطباعة */}
      <div className="print-section print-card">
        <div className="print-card-header">
          <BarChart3 className="h-5 w-5" />
          التوزيع البصري (ملخص)
        </div>
        <div className="print-grid-3">
          <div className="print-stat-box">
            <p className="text-sm text-muted-foreground">الإيرادات</p>
            <p className="text-lg font-bold text-success">{formatCurrency(totalRevenues)}</p>
          </div>
          <div className="print-stat-box">
            <p className="text-sm text-muted-foreground">المصروفات</p>
            <p className="text-lg font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="print-stat-box">
            <p className="text-sm text-muted-foreground">صافي الدخل</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(netAfterExpenses)}</p>
          </div>
        </div>
      </div>

      {/* المقارنة السنوية */}
      {previousYear && (
        <div className="print-section print-card">
          <div className="print-card-header">
            <TrendingUp className="h-5 w-5" />
            المقارنة السنوية
          </div>
          <table className="print-table">
            <thead>
              <tr>
                <th>البند</th>
                <th>{previousYear.year - 1}-{previousYear.year}</th>
                <th>{disclosure.year - 1}-{disclosure.year}</th>
                <th>التغيير</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>الإيرادات</td>
                <td>{formatCurrency(previousYear.total_revenues)}</td>
                <td>{formatCurrency(totalRevenues)}</td>
                <td>{calculateChange(totalRevenues, previousYear.total_revenues).value.toFixed(1)}%</td>
              </tr>
              <tr>
                <td>المصروفات</td>
                <td>{formatCurrency(previousYear.total_expenses)}</td>
                <td>{formatCurrency(totalExpenses)}</td>
                <td>{calculateChange(totalExpenses, previousYear.total_expenses).value.toFixed(1)}%</td>
              </tr>
              <tr>
                <td>صافي الدخل</td>
                <td>{formatCurrency(previousYear.net_income)}</td>
                <td>{formatCurrency(disclosure.net_income)}</td>
                <td>{calculateChange(disclosure.net_income, previousYear.net_income).value.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* الكشف المالي المتسلسل */}
      <div className="print-section print-card">
        <div className="print-card-header">
          <Calculator className="h-5 w-5" />
          الكشف المالي المتسلسل
        </div>
        <div className="space-y-2">
          <div className="print-flow-item flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span>إجمالي الإيرادات</span>
            </div>
            <span className="font-bold text-success">{formatCurrency(totalRevenues)}</span>
          </div>
          <div className="text-center"><ArrowDown className="h-4 w-4 mx-auto" /></div>
          
          <div className="print-flow-item flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span>إجمالي المصروفات</span>
            </div>
            <span className="font-bold text-destructive">({formatCurrency(totalExpenses)})</span>
          </div>
          <div className="text-center"><ArrowDown className="h-4 w-4 mx-auto" /></div>
          
          <div className="print-flow-item flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-info" />
              <span>صافي الدخل قبل الاستقطاعات</span>
            </div>
            <span className="font-bold text-info">{formatCurrency(netAfterExpenses)}</span>
          </div>
          <div className="text-center"><ArrowDown className="h-4 w-4 mx-auto" /></div>
          
          <div className="print-flow-item flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-warning" />
              <span>توزيعات الورثة</span>
            </div>
            <span className="font-bold text-warning">({formatCurrency(distributedAmount)})</span>
          </div>
          <div className="text-center"><ArrowDown className="h-4 w-4 mx-auto" /></div>
          
          <div className="print-flow-item flex justify-between items-center border-2 border-primary">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span>رقبة الوقف (المتبقي)</span>
            </div>
            <span className="font-bold text-primary">{formatCurrency(corpusShare)}</span>
          </div>
        </div>
      </div>

      {/* فاصل صفحة قبل التفاصيل */}
      <div className="print-page-break"></div>

      {/* تفصيل الإيرادات والمصروفات */}
      <div className="print-grid" style={{ marginBottom: '20px' }}>
        {/* الإيرادات */}
        {revenueItems.length > 0 && (
          <div className="print-card">
            <div className="print-card-header">
              <TrendingUp className="h-5 w-5 text-success" />
              تفصيل الإيرادات
            </div>
            <table className="print-table">
              <thead>
                <tr>
                  <th>المصدر</th>
                  <th>المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {revenueItems.map((item) => (
                  <tr key={`revenue-${item.name}`}>
                    <td>{translateRevenueName(item.name)}</td>
                    <td className="text-success">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>الإجمالي</th>
                  <th className="text-success">{formatCurrency(totalRevenues)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* المصروفات */}
        {expenseItems.length > 0 && (
          <div className="print-card">
            <div className="print-card-header">
              <TrendingDown className="h-5 w-5 text-destructive" />
              تفصيل المصروفات
            </div>
            <table className="print-table">
              <thead>
                <tr>
                  <th>البند</th>
                  <th>المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {expenseItems.map((item) => (
                  <tr key={`expense-${item.name}`}>
                    <td>{translateExpenseName(item.name)}</td>
                    <td className="text-destructive">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>الإجمالي</th>
                  <th className="text-destructive">{formatCurrency(totalExpenses)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* توزيعات الورثة */}
      <div className="print-section print-card">
        <div className="print-card-header">
          <Users className="h-5 w-5 text-warning" />
          توزيعات الورثة
        </div>
        <div className="print-grid-4">
          <div className="print-stat-box">
            <p className="text-sm text-muted-foreground">الأبناء</p>
            <p className="text-xl font-bold">{disclosure.sons_count}</p>
            {distributions?.sons_share && (
              <p className="text-sm text-muted-foreground">{formatCurrency(distributions.sons_share)}</p>
            )}
          </div>
          <div className="print-stat-box">
            <p className="text-sm text-muted-foreground">البنات</p>
            <p className="text-xl font-bold">{disclosure.daughters_count}</p>
            {distributions?.daughters_share && (
              <p className="text-sm text-muted-foreground">{formatCurrency(distributions.daughters_share)}</p>
            )}
          </div>
          <div className="print-stat-box">
            <p className="text-sm text-muted-foreground">الزوجات</p>
            <p className="text-xl font-bold">{disclosure.wives_count}</p>
            {distributions?.wives_share && (
              <p className="text-sm text-muted-foreground">{formatCurrency(distributions.wives_share)}</p>
            )}
          </div>
          <div className="print-stat-box">
            <p className="text-sm text-muted-foreground">الإجمالي</p>
            <p className="text-xl font-bold text-primary">{disclosure.total_beneficiaries}</p>
            {distributions?.total && (
              <p className="text-sm text-muted-foreground">{formatCurrency(distributions.total)}</p>
            )}
          </div>
        </div>
      </div>

      {/* نسب التوزيع */}
      <div className="print-section print-card">
        <div className="print-card-header">
          <Percent className="h-5 w-5 text-primary" />
          نسب التوزيع المعتمدة
        </div>
        <div className="print-grid-3">
          <div className="print-stat-box">
            <p className="text-sm text-muted-foreground">حصة الناظر</p>
            <p className="text-xl font-bold">{disclosure.nazer_percentage}%</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(nazerShare)}</p>
          </div>
          <div className="print-stat-box">
            <p className="text-sm text-muted-foreground">صدقة الواقف</p>
            <p className="text-xl font-bold">{disclosure.charity_percentage}%</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(charityShare)}</p>
          </div>
          <div className="print-stat-box">
            <p className="text-sm text-muted-foreground">رأس مال الوقف</p>
            <p className="text-xl font-bold">{disclosure.corpus_percentage}%</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(corpusShare)}</p>
          </div>
        </div>
      </div>

      {/* فاصل صفحة قبل تفاصيل الإيرادات السكنية */}
      <div className="print-page-break"></div>

      {/* تفاصيل الإيرادات السكنية التاريخية (طباعة) */}
      <div className="print-card" style={{ marginBottom: '20px' }}>
        <div className="print-card-header">
          <Building2 className="h-5 w-5" />
          تفاصيل الإيرادات السكنية التاريخية
        </div>

        {!fiscalYearId ? (
          <p className="text-sm text-muted-foreground">لا توجد سنة مالية مرتبطة بهذا الإفصاح.</p>
        ) : !closingId ? (
          <p className="text-sm text-muted-foreground">لا توجد بيانات إقفال للسنة المالية.</p>
        ) : monthlySummary.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد تفاصيل إيجارات تاريخية لهذه السنة.</p>
        ) : (
          <>
            <div className="print-grid-3 mb-4">
              <div className="print-stat-box">
                <p className="text-sm text-muted-foreground">إجمالي المحصّل</p>
                <p className="text-lg font-bold text-success">{formatCurrency(totalCollected)}</p>
              </div>
              <div className="print-stat-box">
                <p className="text-sm text-muted-foreground">عدد الأشهر</p>
                <p className="text-lg font-bold">{monthlySummary.length}</p>
              </div>
              <div className="print-stat-box">
                <p className="text-sm text-muted-foreground">متوسط الشهر</p>
                <p className="text-lg font-bold text-warning">
                  {formatCurrency(monthlySummary.length ? totalCollected / monthlySummary.length : 0)}
                </p>
              </div>
            </div>

            <table className="print-table">
              <thead>
                <tr>
                  <th>الشهر</th>
                  <th>المحصّل</th>
                  <th>مدفوع</th>
                  <th>غير مدفوع</th>
                  <th>شاغر</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((m) => (
                  <tr key={m.month_date}>
                    <td>{m.month_label || m.month_year}</td>
                    <td className="text-success">{formatCurrency(m.paid_amount)}</td>
                    <td>{m.paid_count}</td>
                    <td>{m.unpaid_count}</td>
                    <td>{m.vacant_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* فاصل صفحة قبل المستندات */}
      <div className="print-page-break"></div>

      {/* المستندات الداعمة (طباعة) */}
      <div className="print-card" style={{ marginBottom: '20px' }}>
        <div className="print-card-header">
          <FileText className="h-5 w-5" />
          المستندات الداعمة
        </div>

        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد مستندات مرفقة.</p>
        ) : (
          <>
            {categorySummary.length > 0 && (
              <div className="print-grid-3 mb-4">
                {categorySummary.slice(0, 6).map((cat) => (
                  <div key={cat.type} className="print-stat-box">
                    <p className="text-sm text-muted-foreground">{cat.label}</p>
                    <p className="text-lg font-bold">{cat.count} مستند</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(cat.totalAmount)}</p>
                  </div>
                ))}
              </div>
            )}

            <table className="print-table">
              <thead>
                <tr>
                  <th>المستند</th>
                  <th>النوع</th>
                  <th>الإجمالي</th>
                  <th>تاريخ الرفع</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.document_name}</td>
                    <td>{doc.document_type}</td>
                    <td>{formatCurrency(doc.total_amount || 0)}</td>
                    <td>{new Date(doc.created_at).toLocaleDateString('ar-SA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* تذييل */}
      <div className="print-section text-center border-t pt-4 mt-8">
        <p className="text-sm text-muted-foreground">
          تم إنشاء هذا التقرير آلياً من نظام إدارة الوقف
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}