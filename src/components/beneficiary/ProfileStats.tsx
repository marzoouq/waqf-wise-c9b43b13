import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, Users, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';

interface ProfileStatsProps {
  beneficiaryId: string;
}

export function ProfileStats({ beneficiaryId }: ProfileStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['beneficiary-stats', beneficiaryId],
    queryFn: async () => {
      // Get payments count and total
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('beneficiary_id', beneficiaryId);

      if (paymentsError) throw paymentsError;

      // Get requests stats
      const { data: requests, error: requestsError } = await supabase
        .from('beneficiary_requests')
        .select('status')
        .eq('beneficiary_id', beneficiaryId);

      if (requestsError) throw requestsError;

      // Get attachments count
      const { count: attachmentsCount, error: attachmentsError } = await supabase
        .from('beneficiary_attachments')
        .select('*', { count: 'exact', head: true })
        .eq('beneficiary_id', beneficiaryId);

      if (attachmentsError) throw attachmentsError;

      // Get family members count
      const { count: familyMembersCount, error: familyError } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('beneficiary_id', beneficiaryId);

      if (familyError) throw familyError;

      const totalPayments = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
      const paymentsCount = payments?.length || 0;
      const totalRequests = requests?.length || 0;
      const approvedRequests = requests?.filter(r => r.status === 'معتمد')?.length || 0;
      const pendingRequests = requests?.filter(r => r.status === 'قيد المراجعة')?.length || 0;

      return {
        totalPayments,
        paymentsCount,
        totalRequests,
        approvedRequests,
        pendingRequests,
        attachmentsCount: attachmentsCount || 0,
        familyMembersCount: familyMembersCount || 0,
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
      subtext: `${stats?.paymentsCount} دفعة`,
    },
    {
      title: 'الطلبات المعتمدة',
      value: stats?.approvedRequests || 0,
      icon: CheckCircle,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      subtext: `من ${stats?.totalRequests} طلب`,
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
      subtext: 'للدفعة الواحدة',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="h-4 w-4" />
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
