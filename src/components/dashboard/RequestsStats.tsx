import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useRequests } from '@/hooks/useRequests';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const RequestsStats = () => {
  const { requests, isLoading } = useRequests();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-soft">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'قيد المراجعة' || r.status === 'معلق');
  const overdueRequests = requests.filter(r => r.is_overdue);
  const approvedRequests = requests.filter(r => r.status === 'موافق');
  const rejectedRequests = requests.filter(r => r.status === 'مرفوض');
  const needsApproval = requests.filter(r => 
    r.status === 'قيد المراجعة' && (r.request_type as any)?.requires_approval
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentRequests = requests.filter(r => new Date(r.submitted_at) >= sevenDaysAgo);

  const stats = [
    {
      title: 'إجمالي الطلبات',
      value: requests.length,
      icon: ClipboardList,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'جميع الطلبات المسجلة',
    },
    {
      title: 'طلبات معلقة',
      value: pendingRequests.length,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      description: 'تحتاج إلى معالجة',
    },
    {
      title: 'طلبات متأخرة',
      value: overdueRequests.length,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      description: 'تجاوزت SLA المحدد',
      urgent: true,
    },
    {
      title: 'تحتاج موافقة',
      value: needsApproval.length,
      icon: CheckCircle,
      color: 'text-info',
      bgColor: 'bg-info/10',
      description: 'بانتظار الموافقة',
    },
    {
      title: 'موافق عليها',
      value: approvedRequests.length,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: 'طلبات تمت الموافقة عليها',
    },
    {
      title: 'طلبات جديدة',
      value: recentRequests.length,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10',
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={`shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer group animate-fade-in ${
                stat.urgent ? 'ring-2 ring-destructive/20' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate('/requests')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-sm font-medium ${
                    stat.urgent ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">
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
