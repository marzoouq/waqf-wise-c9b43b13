import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, DollarSign, Download, Award } from 'lucide-react';
import type { 
  BeneficiaryReportData, 
  DistributionReportData, 
  CategoryDataItem, 
  TribeDataItem, 
  TypeDataItem,
  CityDataItem 
} from '@/types/reports/index';

interface BeneficiaryDistributionReportProps {
  beneficiaries: BeneficiaryReportData[];
  distributions: DistributionReportData[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function BeneficiaryDistributionReport({
  beneficiaries,
  distributions,
}: BeneficiaryDistributionReportProps) {
  // حساب الإحصائيات
  const stats = {
    totalBeneficiaries: beneficiaries.length,
    activeBeneficiaries: beneficiaries.filter(b => b.status === 'نشط' || b.status === 'active').length,
    totalDistributed: distributions.reduce((sum, d) => sum + (d.total_amount || 0), 0),
    avgPerBeneficiary: 0,
  };

  stats.avgPerBeneficiary = stats.activeBeneficiaries > 0
    ? stats.totalDistributed / stats.activeBeneficiaries
    : 0;

  // التوزيع حسب الفئة
  const byCategory = beneficiaries.reduce<Record<string, CategoryDataItem>>((acc, b) => {
    const category = b.category || 'غير محدد';
    if (!acc[category]) {
      acc[category] = { name: category, count: 0, amount: 0 };
    }
    acc[category].count++;
    acc[category].amount += b.total_received || 0;
    return acc;
  }, {});

  const categoryData = Object.values(byCategory).map((item) => ({ 
    name: item.name, 
    count: item.count, 
    amount: item.amount 
  }));

  // التوزيع حسب القبيلة
  const byTribe = beneficiaries.reduce<Record<string, TribeDataItem>>((acc, b) => {
    const tribe = b.tribe || 'غير محدد';
    if (!acc[tribe]) {
      acc[tribe] = { name: tribe, count: 0 };
    }
    acc[tribe].count++;
    return acc;
  }, {});

  const tribeData = Object.values(byTribe)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item) => ({ name: item.name, count: item.count }));

  // التوزيع حسب النوع
  const byType = beneficiaries.reduce<Record<string, TypeDataItem>>((acc, b) => {
    const type = b.beneficiary_type || 'غير محدد';
    if (!acc[type]) {
      acc[type] = { name: type, value: 0 };
    }
    acc[type].value++;
    return acc;
  }, {});

  const typeData = Object.values(byType).map((item) => ({ 
    name: item.name, 
    value: item.value
  }));

  // التوزيع حسب المدينة
  const byCity = beneficiaries.reduce<Record<string, CityDataItem>>((acc, b) => {
    const city = b.city || 'غير محدد';
    if (!acc[city]) {
      acc[city] = { city, count: 0 };
    }
    acc[city].count++;
    return acc;
  }, {});

  const cityData = Object.values(byCity)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item) => ({ city: item.city, count: item.count }));

  // أعلى المستفيدين
  const topBeneficiaries = [...beneficiaries]
    .sort((a, b) => (b.total_received || 0) - (a.total_received || 0))
    .slice(0, 10);

  // تحليل التكرار
  const frequencyAnalysis = beneficiaries.map(b => ({
    name: b.full_name,
    frequency: distributions.filter(d =>
      d.distribution_details?.some((dd) => dd.beneficiary_id === b.id)
    ).length,
  }))
    .filter(b => b.frequency > 0)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">تقرير المستفيدين والتوزيعات</h2>
          <p className="text-muted-foreground">تحليل شامل للمستفيدين والمبالغ الموزعة</p>
        </div>
        <Button>
          <Download className="h-4 w-4 ms-2" />
          تصدير التقرير
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="text-sm text-muted-foreground mb-1">إجمالي المستفيدين</div>
          <div className="text-2xl font-bold">{stats.totalBeneficiaries}</div>
          <div className="text-xs text-green-500 mt-1">
            {stats.activeBeneficiaries} نشط
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
          <div className="text-sm text-muted-foreground mb-1">إجمالي الموزع</div>
          <div className="text-2xl font-bold">
            {stats.totalDistributed.toLocaleString('ar-SA')} ريال
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
          <div className="text-sm text-muted-foreground mb-1">المتوسط لكل مستفيد</div>
          <div className="text-2xl font-bold">
            {stats.avgPerBeneficiary.toLocaleString('ar-SA')} ريال
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-8 w-8 text-orange-500" />
          </div>
          <div className="text-sm text-muted-foreground mb-1">عدد التوزيعات</div>
          <div className="text-2xl font-bold">{distributions.length}</div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* By Category */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">التوزيع حسب الفئة</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--primary))" name="العدد" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* By Type */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">التوزيع حسب النوع</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* By Tribe */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">أعلى القبائل (عدد المستفيدين)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tribeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* By City */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">التوزيع حسب المدينة</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Beneficiaries */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">أعلى 10 مستفيدين (المبلغ الإجمالي)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-2">#</th>
                <th className="text-right p-2">الاسم</th>
                <th className="text-right p-2">الفئة</th>
                <th className="text-right p-2">النوع</th>
                <th className="text-right p-2">المبلغ الإجمالي</th>
                <th className="text-right p-2">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {topBeneficiaries.map((b, index) => (
                <tr key={b.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2 font-medium">{b.full_name}</td>
                  <td className="p-2">{b.category}</td>
                  <td className="p-2">{b.beneficiary_type || '-'}</td>
                  <td className="p-2 font-bold text-green-500">
                    {(b.total_received || 0).toLocaleString('ar-SA')} ريال
                  </td>
                  <td className="p-2">
                    <Badge variant={b.status === 'نشط' || b.status === 'active' ? 'default' : 'secondary'}>
                      {b.status === 'نشط' || b.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Frequency Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">تكرار الاستفادة (أكثر 10 مستفيدين)</h3>
        <div className="space-y-2">
          {frequencyAnalysis.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <span className="font-medium">{item.name}</span>
              </div>
              <Badge variant="outline">{item.frequency} توزيع</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
