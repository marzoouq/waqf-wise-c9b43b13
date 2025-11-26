import { UsersRound, Users, TrendingUp, Calendar } from 'lucide-react';
import { useFamilies } from '@/hooks/useFamilies';
import { useNavigate } from 'react-router-dom';
import { UnifiedSectionHeader } from '@/components/unified/UnifiedSectionHeader';
import { UnifiedStatsGrid } from '@/components/unified/UnifiedStatsGrid';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';

const FamiliesStats = () => {
  const { families, isLoading } = useFamilies();
  const navigate = useNavigate();

  const activeFamilies = families.filter(f => f.status === 'نشط');
  const totalMembers = families.reduce((sum, f) => sum + f.total_members, 0);
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newFamilies = families.filter(f => new Date(f.created_at) >= thirtyDaysAgo);

  const stats = [
    {
      title: 'إجمالي العائلات',
      value: families.length.toString(),
      icon: UsersRound,
      variant: 'default' as const,
      subtitle: 'عدد العائلات المسجلة',
    },
    {
      title: 'العائلات النشطة',
      value: activeFamilies.length.toString(),
      icon: TrendingUp,
      variant: 'success' as const,
      subtitle: 'عائلات نشطة حالياً',
    },
    {
      title: 'إجمالي الأفراد',
      value: totalMembers.toString(),
      icon: Users,
      variant: 'default' as const,
      subtitle: 'مجموع أفراد العائلات',
    },
    {
      title: 'عائلات جديدة',
      value: newFamilies.length.toString(),
      icon: Calendar,
      variant: 'warning' as const,
      subtitle: 'خلال آخر 30 يوم',
    },
  ];

  return (
    <div className="space-y-4">
      <UnifiedSectionHeader
        title="إحصائيات العائلات"
        actions={
          <button
            onClick={() => navigate('/families')}
            className="text-sm text-primary hover:underline"
          >
            عرض الكل
          </button>
        }
      />
      
      <UnifiedStatsGrid columns={{ sm: 2, lg: 4 }}>
        {stats.map((stat, index) => (
          <UnifiedKPICard
            key={index}
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

export default FamiliesStats;
