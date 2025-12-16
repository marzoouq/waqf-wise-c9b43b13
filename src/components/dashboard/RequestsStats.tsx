import { ClipboardList, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useRequests } from '@/hooks/requests/useRequests';
import { useNavigate } from 'react-router-dom';
import { safeFilter, safeLength } from '@/lib/utils/array-safe';
import { UnifiedSectionHeader } from '@/components/unified/UnifiedSectionHeader';
import { UnifiedStatsGrid } from '@/components/unified/UnifiedStatsGrid';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';

const RequestsStats = () => {
  const { requests, isLoading } = useRequests();
  const navigate = useNavigate();

  const pendingRequests = safeFilter(requests, r => r.status === 'قيد المراجعة' || r.status === 'معلق');
  const overdueRequests = safeFilter(requests, r => r.is_overdue);
  const approvedRequests = safeFilter(requests, r => r.status === 'موافق');
  const needsApproval = safeFilter(requests, r => r.status === 'قيد المراجعة');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentRequests = safeFilter(requests, r => new Date(r.submitted_at) >= sevenDaysAgo);

  const stats = [
    {
      title: 'إجمالي الطلبات',
      value: safeLength(requests).toString(),
      icon: ClipboardList,
      variant: 'default' as const,
      subtitle: 'جميع الطلبات المسجلة',
    },
    {
      title: 'طلبات معلقة',
      value: pendingRequests.length.toString(),
      icon: Clock,
      variant: 'warning' as const,
      subtitle: 'تحتاج إلى معالجة',
    },
    {
      title: 'طلبات متأخرة',
      value: overdueRequests.length.toString(),
      icon: AlertTriangle,
      variant: 'danger' as const,
      subtitle: 'تجاوزت SLA المحدد',
    },
    {
      title: 'تحتاج موافقة',
      value: needsApproval.length.toString(),
      icon: CheckCircle,
      variant: 'default' as const,
      subtitle: 'بانتظار الموافقة',
    },
    {
      title: 'موافق عليها',
      value: approvedRequests.length.toString(),
      icon: CheckCircle,
      variant: 'success' as const,
      subtitle: 'طلبات تمت الموافقة عليها',
    },
    {
      title: 'طلبات جديدة',
      value: recentRequests.length.toString(),
      icon: TrendingUp,
      variant: 'default' as const,
      subtitle: 'خلال آخر 7 أيام',
    },
  ];

  return (
    <div className="space-y-4">
      <UnifiedSectionHeader
        title="إحصائيات الطلبات"
        actions={
          <button
            onClick={() => navigate('/staff/requests')}
            className="text-sm text-primary hover:underline"
          >
            عرض الكل
          </button>
        }
      />
      
      <UnifiedStatsGrid columns={{ sm: 2, lg: 3 }}>
        {stats.map((stat) => (
          <UnifiedKPICard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            subtitle={stat.subtitle}
            variant={stat.variant}
            loading={isLoading}
          />
        ))}
      </UnifiedStatsGrid>
    </div>
  );
};

export default RequestsStats;
