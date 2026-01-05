/**
 * DisclosurePrintTemplate - قالب طباعة مستقل للإفصاح
 * يُستخدم مع printWithData() لفتح نافذة طباعة نظيفة
 * @version 1.0.0
 */

import { AnnualDisclosure } from "@/hooks/reports/useAnnualDisclosures";

interface DisclosurePrintData {
  disclosure: AnnualDisclosure;
  previousYear: AnnualDisclosure | null;
}

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
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " ر.س";
};

const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "0%";
  return `${value}%`;
};

export function DisclosurePrintTemplate({ disclosure, previousYear }: DisclosurePrintData) {
  // Parse data
  const expensesBreakdown = disclosure.expenses_breakdown as Record<string, number> | null;
  const expenseItems: ExpenseItem[] = expensesBreakdown 
    ? Object.entries(expensesBreakdown)
        .filter(([name]) => name.toLowerCase() !== 'total')
        .map(([name, amount]) => ({ name, amount: amount || 0 }))
    : [];

  const revenueBreakdown = disclosure.revenue_breakdown as Record<string, number> | null;
  const revenueItems: RevenueItem[] = revenueBreakdown
    ? Object.entries(revenueBreakdown)
        .filter(([name]) => name.toLowerCase() !== 'total')
        .map(([name, amount]) => ({ name, amount: amount || 0 }))
    : [];

  const beneficiariesDetails = disclosure.beneficiaries_details as BeneficiariesDetails | null;
  const distributions = beneficiariesDetails?.distributions;

  const totalRevenues = disclosure.total_revenues || 0;
  const totalExpenses = disclosure.total_expenses || 0;
  const netIncome = disclosure.net_income || 0;
  const nazerShare = disclosure.nazer_share || 0;
  const charityShare = disclosure.charity_share || 0;
  const corpusShare = disclosure.corpus_share || 0;
  const vatAmount = disclosure.vat_amount || 0;
  const distributedAmount = distributions?.total || 0;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', direction: 'rtl', padding: '20px', maxWidth: '210mm' }}>
      {/* أنماط الطباعة */}
      <style>{`
        @page { 
          size: A4; 
          margin: 15mm; 
        }
        body {
          font-size: 12px;
          line-height: 1.5;
          color: #333;
        }
        .print-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #333;
        }
        .print-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #1a365d;
        }
        .print-subtitle {
          font-size: 16px;
          color: #555;
        }
        .print-section {
          margin-bottom: 25px;
          page-break-inside: auto;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #1a365d;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #ddd;
        }
        .summary-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }
        .summary-box {
          flex: 1;
          min-width: 150px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          text-align: center;
          background: #fafafa;
          page-break-inside: avoid;
        }
        .summary-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 5px;
        }
        .summary-value {
          font-size: 16px;
          font-weight: bold;
          color: #1a365d;
        }
        .summary-value.positive { color: #16a34a; }
        .summary-value.negative { color: #dc2626; }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .data-table th,
        .data-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: right;
        }
        .data-table th {
          background: #f0f0f0;
          font-weight: bold;
        }
        .data-table .total-row {
          background: #e8f4f8;
          font-weight: bold;
        }
        .flow-section {
          margin-bottom: 20px;
        }
        .flow-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          margin-bottom: 8px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fafafa;
          page-break-inside: avoid;
        }
        .flow-item.highlight {
          border: 2px solid #1a365d;
          background: #e8f4f8;
        }
        .flow-arrow {
          text-align: center;
          padding: 5px 0;
          color: #999;
          font-size: 18px;
        }
        .beneficiaries-section {
          margin-top: 20px;
        }
        .heir-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .heir-box {
          flex: 1;
          min-width: 120px;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          text-align: center;
          background: #fafafa;
          page-break-inside: avoid;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 10px;
          color: #888;
        }
      `}</style>

      {/* الرأس */}
      <div className="print-header">
        <div className="print-title">الإفصاح السنوي {disclosure.year - 1}-{disclosure.year}</div>
        <div className="print-subtitle">{disclosure.waqf_name}</div>
        <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
          تاريخ الإصدار: {new Date(disclosure.disclosure_date).toLocaleDateString('ar-SA')}
        </div>
      </div>

      {/* ملخص الأرقام الرئيسية */}
      <div className="print-section">
        <div className="section-title">ملخص الأرقام الرئيسية</div>
        <div className="summary-grid">
          <div className="summary-box">
            <div className="summary-label">إجمالي الإيرادات</div>
            <div className="summary-value positive">{formatCurrency(totalRevenues)}</div>
          </div>
          <div className="summary-box">
            <div className="summary-label">إجمالي المصروفات</div>
            <div className="summary-value negative">{formatCurrency(totalExpenses)}</div>
          </div>
          <div className="summary-box">
            <div className="summary-label">صافي الدخل</div>
            <div className="summary-value">{formatCurrency(netIncome)}</div>
          </div>
          <div className="summary-box">
            <div className="summary-label">عدد المستفيدين</div>
            <div className="summary-value">{disclosure.total_beneficiaries}</div>
          </div>
        </div>
      </div>

      {/* التدفق المالي */}
      <div className="print-section">
        <div className="section-title">التدفق المالي</div>
        <div className="flow-section">
          <div className="flow-item">
            <span>إجمالي الإيرادات</span>
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{formatCurrency(totalRevenues)}</span>
          </div>
          <div className="flow-arrow">↓</div>
          <div className="flow-item">
            <span>(-) إجمالي المصروفات</span>
            <span style={{ color: '#dc2626', fontWeight: 'bold' }}>({formatCurrency(totalExpenses)})</span>
          </div>
          <div className="flow-arrow">↓</div>
          <div className="flow-item">
            <span>= صافي الدخل</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(netIncome)}</span>
          </div>
          <div className="flow-arrow">↓</div>
          <div className="flow-item">
            <span>(-) نصيب الناظر ({formatPercent(disclosure.nazer_percentage)})</span>
            <span style={{ color: '#dc2626' }}>({formatCurrency(nazerShare)})</span>
          </div>
          <div className="flow-item">
            <span>(-) نصيب الخيرات ({formatPercent(disclosure.charity_percentage)})</span>
            <span style={{ color: '#dc2626' }}>({formatCurrency(charityShare)})</span>
          </div>
          {vatAmount > 0 && (
            <div className="flow-item">
              <span>(-) ضريبة القيمة المضافة</span>
              <span style={{ color: '#dc2626' }}>({formatCurrency(vatAmount)})</span>
            </div>
          )}
          <div className="flow-arrow">↓</div>
          <div className="flow-item">
            <span>(-) توزيعات الورثة</span>
            <span style={{ color: '#dc2626' }}>({formatCurrency(distributedAmount)})</span>
          </div>
          <div className="flow-arrow">↓</div>
          <div className="flow-item highlight">
            <span style={{ fontWeight: 'bold' }}>رقبة الوقف (المتبقي)</span>
            <span style={{ color: '#1a365d', fontWeight: 'bold', fontSize: '18px' }}>{formatCurrency(corpusShare)}</span>
          </div>
        </div>
      </div>

      {/* تفصيل الإيرادات */}
      {revenueItems.length > 0 && (
        <div className="print-section">
          <div className="section-title">تفصيل الإيرادات</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>المصدر</th>
                <th style={{ width: '150px' }}>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {revenueItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{translateRevenueName(item.name)}</td>
                  <td style={{ color: '#16a34a' }}>{formatCurrency(item.amount)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td>الإجمالي</td>
                <td style={{ color: '#16a34a' }}>{formatCurrency(totalRevenues)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* تفصيل المصروفات */}
      {expenseItems.length > 0 && (
        <div className="print-section">
          <div className="section-title">تفصيل المصروفات</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>البند</th>
                <th style={{ width: '150px' }}>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {expenseItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{translateExpenseName(item.name)}</td>
                  <td style={{ color: '#dc2626' }}>{formatCurrency(item.amount)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td>الإجمالي</td>
                <td style={{ color: '#dc2626' }}>{formatCurrency(totalExpenses)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* توزيعات المستفيدين */}
      {distributions && (
        <div className="print-section beneficiaries-section">
          <div className="section-title">توزيعات المستفيدين</div>
          <div className="heir-grid">
            {(distributions.sons_count ?? disclosure.sons_count ?? 0) > 0 && (
              <div className="heir-box">
                <div className="summary-label">الأبناء ({distributions.sons_count ?? disclosure.sons_count})</div>
                <div className="summary-value">{formatCurrency(distributions.sons_share)}</div>
              </div>
            )}
            {(distributions.daughters_count ?? disclosure.daughters_count ?? 0) > 0 && (
              <div className="heir-box">
                <div className="summary-label">البنات ({distributions.daughters_count ?? disclosure.daughters_count})</div>
                <div className="summary-value">{formatCurrency(distributions.daughters_share)}</div>
              </div>
            )}
            {(distributions.wives_count ?? disclosure.wives_count ?? 0) > 0 && (
              <div className="heir-box">
                <div className="summary-label">الزوجات ({distributions.wives_count ?? disclosure.wives_count})</div>
                <div className="summary-value">{formatCurrency(distributions.wives_share)}</div>
              </div>
            )}
          </div>
          <div style={{ marginTop: '15px', textAlign: 'center', padding: '15px', background: '#e8f4f8', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>إجمالي التوزيعات</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a365d' }}>{formatCurrency(distributions.total)}</div>
          </div>
        </div>
      )}

      {/* المقارنة مع العام السابق */}
      {previousYear && (
        <div className="print-section">
          <div className="section-title">المقارنة مع العام السابق ({previousYear.year - 1}-{previousYear.year})</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>البند</th>
                <th>العام الحالي</th>
                <th>العام السابق</th>
                <th>التغيير</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>إجمالي الإيرادات</td>
                <td>{formatCurrency(totalRevenues)}</td>
                <td>{formatCurrency(previousYear.total_revenues)}</td>
                <td style={{ color: totalRevenues >= (previousYear.total_revenues || 0) ? '#16a34a' : '#dc2626' }}>
                  {formatCurrency(totalRevenues - (previousYear.total_revenues || 0))}
                </td>
              </tr>
              <tr>
                <td>إجمالي المصروفات</td>
                <td>{formatCurrency(totalExpenses)}</td>
                <td>{formatCurrency(previousYear.total_expenses)}</td>
                <td style={{ color: totalExpenses <= (previousYear.total_expenses || 0) ? '#16a34a' : '#dc2626' }}>
                  {formatCurrency(totalExpenses - (previousYear.total_expenses || 0))}
                </td>
              </tr>
              <tr>
                <td>صافي الدخل</td>
                <td>{formatCurrency(netIncome)}</td>
                <td>{formatCurrency(previousYear.net_income)}</td>
                <td style={{ color: netIncome >= (previousYear.net_income || 0) ? '#16a34a' : '#dc2626' }}>
                  {formatCurrency(netIncome - (previousYear.net_income || 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* التذييل */}
      <div className="footer">
        <div>تم إنشاء هذا التقرير بواسطة نظام إدارة الوقف</div>
        <div>تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')} - {new Date().toLocaleTimeString('ar-SA')}</div>
      </div>
    </div>
  );
}
