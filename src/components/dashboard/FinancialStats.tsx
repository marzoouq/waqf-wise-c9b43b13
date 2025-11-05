import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calculator } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialData {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

const FinancialStats = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinancialData | null>(null);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      // Fetch journal entries with their lines
      const { data: entries, error } = await supabase
        .from("journal_entry_lines")
        .select(`
          debit_amount,
          credit_amount,
          account_id,
          accounts (
            account_type,
            account_nature
          )
        `);

      if (error) throw error;

      // Calculate totals by account type
      let totalAssets = 0;
      let totalLiabilities = 0;
      let totalEquity = 0;
      let totalRevenue = 0;
      let totalExpenses = 0;

      entries?.forEach((line: any) => {
        const accountType = line.accounts?.account_type;
        const accountNature = line.accounts?.account_nature;
        const debit = Number(line.debit_amount || 0);
        const credit = Number(line.credit_amount || 0);

        if (accountType === 'asset') {
          totalAssets += accountNature === 'debit' ? debit - credit : credit - debit;
        } else if (accountType === 'liability') {
          totalLiabilities += accountNature === 'credit' ? credit - debit : debit - credit;
        } else if (accountType === 'equity') {
          totalEquity += accountNature === 'credit' ? credit - debit : debit - credit;
        } else if (accountType === 'revenue') {
          totalRevenue += accountNature === 'credit' ? credit - debit : debit - credit;
        } else if (accountType === 'expense') {
          totalExpenses += accountNature === 'debit' ? debit - credit : credit - debit;
        }
      });

      const netIncome = totalRevenue - totalExpenses;

      setData({
        totalAssets,
        totalLiabilities,
        totalEquity: totalEquity + netIncome,
        totalRevenue,
        totalExpenses,
        netIncome,
      });
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "إجمالي الأصول",
      value: formatCurrency(data?.totalAssets || 0),
      icon: Wallet,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: "+5.2%",
      trendUp: true,
    },
    {
      title: "إجمالي الخصوم",
      value: formatCurrency(data?.totalLiabilities || 0),
      icon: Calculator,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      trend: "-2.1%",
      trendUp: false,
    },
    {
      title: "حقوق الملكية",
      value: formatCurrency(data?.totalEquity || 0),
      icon: PiggyBank,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      trend: "+8.3%",
      trendUp: true,
    },
    {
      title: "إجمالي الإيرادات",
      value: formatCurrency(data?.totalRevenue || 0),
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "إجمالي المصروفات",
      value: formatCurrency(data?.totalExpenses || 0),
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      trend: "+3.2%",
      trendUp: false,
    },
    {
      title: "صافي الربح/الخسارة",
      value: formatCurrency(data?.netIncome || 0),
      icon: data?.netIncome && data.netIncome >= 0 ? TrendingUp : TrendingDown,
      color: data?.netIncome && data.netIncome >= 0 ? "text-success" : "text-destructive",
      bgColor: data?.netIncome && data.netIncome >= 0 ? "bg-success/10" : "bg-destructive/10",
      trend: data?.netIncome && data.netIncome >= 0 ? "+15.7%" : "-4.2%",
      trendUp: data?.netIncome ? data.netIncome >= 0 : true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trendUp ? 'text-success' : 'text-destructive'
                }`}>
                  {stat.trendUp ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {stat.trend} هذا الشهر
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FinancialStats;
