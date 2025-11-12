import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersRound, Users, TrendingUp, Calendar } from 'lucide-react';
import { useFamilies } from '@/hooks/useFamilies';
import { LoadingState } from '@/components/shared/LoadingState';
import { useNavigate } from 'react-router-dom';

const FamiliesStats = () => {
  const { families, isLoading } = useFamilies();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingState />;
  }

  const activeFamilies = families.filter(f => f.status === 'نشط');
  const totalMembers = families.reduce((sum, f) => sum + f.total_members, 0);
  
  // العائلات المضافة في آخر 30 يوم
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newFamilies = families.filter(f => new Date(f.created_at) >= thirtyDaysAgo);

  const stats = [
    {
      title: 'إجمالي العائلات',
      value: families.length,
      icon: UsersRound,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      description: 'عدد العائلات المسجلة',
    },
    {
      title: 'العائلات النشطة',
      value: activeFamilies.length,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      description: 'عائلات نشطة حالياً',
    },
    {
      title: 'إجمالي الأفراد',
      value: totalMembers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      description: 'مجموع أفراد العائلات',
    },
    {
      title: 'عائلات جديدة',
      value: newFamilies.length,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      description: 'خلال آخر 30 يوم',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">إحصائيات العائلات</h2>
        <button
          onClick={() => navigate('/families')}
          className="text-sm text-primary hover:underline"
        >
          عرض الكل
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer"
              onClick={() => navigate('/families')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
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

export default FamiliesStats;
