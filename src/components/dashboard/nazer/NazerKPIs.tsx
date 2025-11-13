import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Home, 
  CreditCard,
  Wallet,
  PieChart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface KPIData {
  totalAssets: number;
  totalRevenue: number;
  activeBeneficiaries: number;
  activeProperties: number;
  occupiedProperties: number;
  pendingLoans: number;
  availableBudget: number;
  monthlyReturn: number;
}

export default function NazerKPIs() {
  const [data, setData] = useState<KPIData>({
    totalAssets: 0,
    totalRevenue: 0,
    activeBeneficiaries: 0,
    activeProperties: 0,
    occupiedProperties: 0,
    pendingLoans: 0,
    availableBudget: 0,
    monthlyReturn: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchKPIs();

    // Real-time updates
    const channel = supabase
      .channel('nazer-kpis')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_entry_lines' }, fetchKPIs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beneficiaries' }, fetchKPIs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, fetchKPIs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, fetchKPIs)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchKPIs = async () => {
    setIsLoading(true);

    // جلب الأصول الكلية
    const { data: accountsData } = await supabase
      .from('journal_entry_lines')
      .select('debit_amount, credit_amount, accounts(account_type, account_nature)');

    let totalAssets = 0;
    let totalRevenue = 0;

    if (accountsData) {
      accountsData.forEach(line => {
        if (line.accounts?.account_type === 'asset') {
          totalAssets += (line.debit_amount || 0) - (line.credit_amount || 0);
        } else if (line.accounts?.account_type === 'revenue') {
          totalRevenue += (line.credit_amount || 0) - (line.debit_amount || 0);
        }
      });
    }

    // جلب المستفيدين النشطين
    const { count: beneficiariesCount } = await supabase
      .from('beneficiaries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'نشط');

    // جلب العقارات
    const { count: propertiesCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'نشط');

    const { count: occupiedCount } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'نشط');

    // جلب القروض المستحقة
    const { count: loansCount } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'defaulted']);

    // جلب الحسابات البنكية
    const { data: bankAccounts } = await supabase
      .from('bank_accounts')
      .select('current_balance')
      .eq('is_active', true);

    const availableBudget = bankAccounts?.reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0;

    // حساب العائد الشهري (الإيرادات الشهرية)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const { data: monthlyData } = await supabase
      .from('journal_entry_lines')
      .select('credit_amount, debit_amount, journal_entries!inner(entry_date), accounts!inner(account_type)')
      .eq('accounts.account_type', 'revenue')
      .gte('journal_entries.entry_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`);

    const monthlyReturn = monthlyData?.reduce((sum, line) => 
      sum + (line.credit_amount || 0) - (line.debit_amount || 0), 0
    ) || 0;

    setData({
      totalAssets,
      totalRevenue,
      activeBeneficiaries: beneficiariesCount || 0,
      activeProperties: propertiesCount || 0,
      occupiedProperties: occupiedCount || 0,
      pendingLoans: loansCount || 0,
      availableBudget,
      monthlyReturn
    });

    setIsLoading(false);
  };

  const kpis = [
    {
      title: "إجمالي الأصول",
      value: data.totalAssets,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      format: "currency"
    },
    {
      title: "العوائد الشهرية",
      value: data.monthlyReturn,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      format: "currency"
    },
    {
      title: "المستفيدون النشطون",
      value: data.activeBeneficiaries,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      format: "number"
    },
    {
      title: "الميزانية المتاحة",
      value: data.availableBudget,
      icon: Wallet,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      format: "currency"
    },
    {
      title: "العقارات النشطة",
      value: data.activeProperties,
      icon: Home,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      format: "number"
    },
    {
      title: "العقارات المؤجرة",
      value: data.occupiedProperties,
      icon: Building2,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      format: "number"
    },
    {
      title: "القروض المستحقة",
      value: data.pendingLoans,
      icon: CreditCard,
      color: "text-red-600",
      bgColor: "bg-red-50",
      format: "number"
    },
    {
      title: "إجمالي الإيرادات",
      value: data.totalRevenue,
      icon: PieChart,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      format: "currency"
    }
  ];

  const formatValue = (value: number, format: string) => {
    if (format === "currency") {
      return `${value.toLocaleString('ar-SA')} ر.س`;
    }
    return value.toLocaleString('ar-SA');
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-10 w-10 bg-muted rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className={`${kpi.bgColor} p-2 rounded-full`}>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpi.color}`}>
              {formatValue(kpi.value, kpi.format)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              حتى اليوم
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
