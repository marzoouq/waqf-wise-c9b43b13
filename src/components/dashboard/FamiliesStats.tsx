import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersRound, Users, TrendingUp, Calendar } from 'lucide-react';
import { useFamilies } from '@/hooks/useFamilies';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const FamiliesStats = () => {
  const { families, isLoading } = useFamilies();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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

  const activeFamilies = families.filter(f => f.status === 'نشط');
  const totalMembers = families.reduce((sum, f) => sum + f.total_members, 0);
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newFamilies = families.filter(f => new Date(f.created_at) >= thirtyDaysAgo);

  const stats = [
    {
      title: 'إجمالي العائلات',
      value: families.length,
      icon: UsersRound,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'عدد العائلات المسجلة',
    },
    {
      title: 'العائلات النشطة',
      value: activeFamilies.length,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: 'عائلات نشطة حالياً',
    },
    {
      title: 'إجمالي الأفراد',
      value: totalMembers,
      icon: Users,
      color: 'text-info',
      bgColor: 'bg-info/10',
      description: 'مجموع أفراد العائلات',
    },
    {
      title: 'عائلات جديدة',
      value: newFamilies.length,
      icon: Calendar,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer group animate-fade-in flex flex-col"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate('/families')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
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

export default FamiliesStats;
