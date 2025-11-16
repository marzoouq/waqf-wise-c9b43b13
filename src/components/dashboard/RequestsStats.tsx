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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    r.status === 'قيد المراجعة'
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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg md:text-xl font-bold">إحصائيات الطلبات</h2>
        <button
          onClick={() => navigate('/requests')}
          className="text-xs sm:text-sm text-primary hover:underline"
        >
          عرض الكل
        </button>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 items-stretch">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={`shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col ${
                stat.urgent ? 'ring-1 sm:ring-2 ring-destructive/50' : ''
              }`}
              onClick={() => navigate('/requests')}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-[10px] sm:text-xs md:text-sm font-medium line-clamp-1 ${
                    stat.urgent ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {stat.title}
                  </CardTitle>
                  <div className={`p-1 sm:p-1.5 md:p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    <Icon className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-2 sm:pb-4">
                <div className={`text-lg sm:text-2xl md:text-3xl font-bold ${stat.color} mb-1 sm:mb-2`}>
                  {stat.value}
                </div>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2">
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
