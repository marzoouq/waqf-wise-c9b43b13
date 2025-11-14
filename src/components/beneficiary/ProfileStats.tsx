import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, Users, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';

interface ProfileStatsProps {
  beneficiaryId: string;
}

interface StatsData {
  totalPayments: number;
  paymentsCount: number;
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  attachmentsCount: number;
  familyMembersCount: number;
}

export function ProfileStats({ beneficiaryId }: ProfileStatsProps) {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ['beneficiary-stats', beneficiaryId],
    queryFn: async () => {
      // @ts-ignore - Avoiding deep type instantiation
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('beneficiary_id', beneficiaryId);

      // @ts-ignore
      const { data: requests } = await supabase
        .from('beneficiary_requests')
        .select('status')
        .eq('beneficiary_id', beneficiaryId);

      // @ts-ignore
      const { count: attachmentsCount } = await supabase
        .from('beneficiary_attachments')
        .select('*', { count: 'exact', head: true })
        .eq('beneficiary_id', beneficiaryId);

      // @ts-ignore
      const { count: familyCount } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('beneficiary_id', beneficiaryId);

      const totalPayments = (payments || []).reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
      const approvedCount = (requests || []).filter((r: any) => r.status === 'معتمد').length;
      const pendingCount = (requests || []).filter((r: any) => r.status === 'قيد المراجعة').length;

      return {
        totalPayments,
        paymentsCount: payments?.length || 0,
        totalRequests: requests?.length || 0,
        approvedRequests: approvedCount,
        pendingRequests: pendingCount,
        attachmentsCount: attachmentsCount || 0,
        familyMembersCount: familyCount || 0,
      };
    },
  });

  if (isLoading) {
    return <LoadingState message="جاري تحميل الإحصائيات..." />;
  }

  const statCards = [
    {
      title: 'إجمالي المدفوعات',
      value: `${stats?.totalPayments?.toLocaleString('ar-SA') || 0} ريال`,
      icon: DollarSign,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      subtext: `${stats?.paymentsCount || 0} دفعة`,
    },
    {
      title: 'الطلبات المعتمدة',
      value: stats?.approvedRequests || 0,
      icon: CheckCircle,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      subtext: `من ${stats?.totalRequests || 0} طلب`,
    },
    {
      title: 'الطلبات المعلقة',
      value: stats?.pendingRequests || 0,
      icon: Calendar,
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      subtext: 'قيد المراجعة',
    },
    {
      title: 'المستندات',
      value: stats?.attachmentsCount || 0,
      icon: FileText,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
      subtext: 'مرفق',
    },
    {
      title: 'أفراد العائلة',
      value: stats?.familyMembersCount || 0,
      icon: Users,
      color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30',
      subtext: 'فرد مسجل',
    },
    {
      title: 'متوسط الدفعة',
      value: stats?.paymentsCount 
        ? `${Math.round((stats.totalPayments || 0) / stats.paymentsCount).toLocaleString('ar-SA')} ريال`
        : '0 ريال',
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
      subtext: 'لكل دفعة',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
