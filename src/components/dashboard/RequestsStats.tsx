import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Clock, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { useRequests } from '@/hooks/useRequests';
import { LoadingState } from '@/components/shared/LoadingState';
import { useNavigate } from 'react-router-dom';

const RequestsStats = () => {
  const { requests, isLoading } = useRequests();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingState />;
  }

  const pendingRequests = requests.filter(r => r.status === 'قيد المراجعة' || r.status === 'معلق');
  const overdueRequests = requests.filter(r => r.is_overdue);
  const approvedRequests = requests.filter(r => r.status === 'موافق');
  const rejectedRequests = requests.filter(r => r.status === 'مرفوض');
  const needsApproval = requests.filter(r => 
    r.status === 'قيد المراجعة' && (r.request_type as any)?.requires_approval
  );

  // الطلبات في آخر 7 أيام
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentRequests = requests.filter(r => new Date(r.submitted_at) >= sevenDaysAgo);

  const stats = [
    {
      title: 'إجمالي الطلبات',
      value: requests.length,
      icon: ClipboardList,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      description: 'جميع الطلبات المسجلة',
    },
    {
      title: 'طلبات معلقة',
      value: pendingRequests.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      description: 'تحتاج إلى معالجة',
    },
    {
      title: 'طلبات متأخرة',
      value: overdueRequests.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      description: 'تجاوزت SLA المحدد',
      urgent: true,
    },
    {
      title: 'تحتاج موافقة',
      value: needsApproval.length,
      icon: CheckCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      description: 'بانتظار الموافقة',
    },
    {
      title: 'موافق عليها',
      value: approvedRequests.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      description: 'طلبات تمت الموافقة عليها',
    },
    {
      title: 'طلبات جديدة',
      value: recentRequests.length,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      description: 'خلال آخر 7 أيام',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">إحصائيات الطلبات</h2>
        <button
          onClick={() => navigate('/requests')}
          className="text-sm text-primary hover:underline"
        >
          عرض الكل
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={`shadow-soft hover:shadow-medium transition-shadow cursor-pointer ${
                stat.urgent ? 'border-red-500 dark:border-red-800' : ''
              }`}
              onClick={() => navigate('/requests')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${
                  stat.urgent ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  stat.urgent && stat.value > 0 ? 'text-red-600' : ''
                }`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RequestsStats;
