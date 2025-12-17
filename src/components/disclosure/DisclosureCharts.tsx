/**
 * DisclosureCharts - مكون الرسوم البيانية للإفصاح
 * @description يعرض رسوم بيانية تفاعلية لتوزيع الإيرادات والمصروفات
 * @version 2.8.66
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { AnnualDisclosure } from "@/hooks/reports/useAnnualDisclosures";

interface DisclosureChartsProps {
  disclosure: AnnualDisclosure;
}

// ألوان متناسقة مع التصميم
const REVENUE_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
const EXPENSE_COLORS = ['#ef4444', '#f87171', '#fca5a5', '#fecaca'];
const HEIR_COLORS = ['#3b82f6', '#ec4899', '#f59e0b'];

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toFixed(0);
};

// ترجمة أسماء الإيرادات
const revenueNameTranslations: Record<string, string> = {
  'jeddah_properties': 'عقارات جدة',
  'nahdi_rental': 'إيجار النهدي',
  'remaining_2024': 'متبقي 2024',
  'residential_monthly': 'الإيجارات السكنية',
};

// ترجمة أسماء المصروفات
const expenseNameTranslations: Record<string, string> = {
  'electricity_bills': 'الكهرباء',
  'water_bills': 'المياه',
  'maintenance': 'الصيانة',
  'plumbing_works': 'السباكة',
  'electrical_works': 'الكهربائية',
  'cleaning_worker': 'النظافة',
  'audit_2024': 'التدقيق',
  'audit_2025': 'التدقيق',
  'miscellaneous': 'متنوعة',
  'zakat': 'الزكاة',
};

const translateName = (name: string, type: 'revenue' | 'expense'): string => {
  const translations = type === 'revenue' ? revenueNameTranslations : expenseNameTranslations;
  return translations[name.toLowerCase()] || name;
};

export function DisclosureCharts({ disclosure }: DisclosureChartsProps) {
  // تحويل بيانات الإيرادات
  const revenueBreakdown = disclosure.revenue_breakdown as Record<string, number> | null;
  const revenueData = revenueBreakdown 
    ? Object.entries(revenueBreakdown)
        .filter(([name]) => name.toLowerCase() !== 'total')
        .map(([name, value]) => ({
          name: translateName(name, 'revenue'),
          value: value || 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4)
    : [];

  // تحويل بيانات المصروفات
  const expensesBreakdown = disclosure.expenses_breakdown as Record<string, number> | null;
  const expenseData = expensesBreakdown
    ? Object.entries(expensesBreakdown)
        .filter(([name]) => name.toLowerCase() !== 'total')
        .map(([name, value]) => ({
          name: translateName(name, 'expense'),
          value: value || 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4)
    : [];

  // بيانات توزيعات الورثة
  const beneficiariesDetails = disclosure.beneficiaries_details as {
    distributions?: {
      sons_share?: number;
      daughters_share?: number;
      wives_share?: number;
    };
  } | null;

  const heirsData = [
    { name: 'الأبناء', value: beneficiariesDetails?.distributions?.sons_share || 512132.35 },
    { name: 'البنات', value: beneficiariesDetails?.distributions?.daughters_share || 358492.65 },
    { name: 'الزوجات', value: beneficiariesDetails?.distributions?.wives_share || 124375 },
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-2 text-xs">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-muted-foreground">
            {new Intl.NumberFormat('ar-SA').format(payload[0].value)} ر.س
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2 p-3 sm:p-4">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          التوزيع البصري
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          رسوم بيانية توضح توزيع الإيرادات والمصروفات والتوزيعات
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* دائرة الإيرادات */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-medium text-center text-emerald-600">الإيرادات</h4>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {revenueData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={REVENUE_COLORS[index % REVENUE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px', direction: 'rtl' }}
                    formatter={(value) => <span className="text-[10px] sm:text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-xs">
                لا توجد بيانات
              </div>
            )}
          </div>

          {/* دائرة المصروفات */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-medium text-center text-destructive">المصروفات</h4>
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px', direction: 'rtl' }}
                    formatter={(value) => <span className="text-[10px] sm:text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-xs">
                لا توجد بيانات
              </div>
            )}
          </div>

          {/* مخطط شريطي للتوزيعات */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-medium text-center text-amber-600">توزيعات الورثة</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={heirsData} layout="vertical">
                <XAxis type="number" tickFormatter={formatCurrency} fontSize={10} />
                <YAxis type="category" dataKey="name" fontSize={10} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {heirsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={HEIR_COLORS[index % HEIR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
