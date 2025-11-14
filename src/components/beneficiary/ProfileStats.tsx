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
    queryFn: async (): Promise<any> => {
      // Fetch payments
      const paymentsRes: any = await supabase
        .from('payments')
        .select('amount')
        .eq('beneficiary_id', beneficiaryId);
      
      if (paymentsRes.error) throw paymentsRes.error;

      // Fetch requests
      const requestsRes: any = await supabase
        .from('beneficiary_requests')
        .select('status')
        .eq('beneficiary_id', beneficiaryId);
      
      if (requestsRes.error) throw requestsRes.error;

      // Fetch attachments count
      const attachmentsRes: any = await supabase
        .from('beneficiary_attachments')
        .select('*', { count: 'exact', head: true })
        .eq('beneficiary_id', beneficiaryId);
      
      if (attachmentsRes.error) throw attachmentsRes.error;

      // Fetch family members count
      const familyRes: any = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('beneficiary_id', beneficiaryId);
      
      if (familyRes.error) throw familyRes.error;

      const payments = paymentsRes.data || [];
      const requests = requestsRes.data || [];
      const totalPayments = payments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
      const approvedRequests = requests.filter((r: any) => r.status === 'معتمد').length;
      const pendingRequests = requests.filter((r: any) => r.status === 'قيد المراجعة').length;

      return {
        totalPayments,
        paymentsCount: payments.length,
        totalRequests: requests.length,
        approvedRequests,
        pendingRequests,
        attachmentsCount: attachmentsRes.count || 0,
        familyMembersCount: familyRes.count || 0,
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
