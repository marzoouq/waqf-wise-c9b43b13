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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg md:text-xl font-bold">إحصائيات العائلات</h2>
        <button
          onClick={() => navigate('/families')}
          className="text-xs sm:text-sm text-primary hover:underline"
        >
          عرض الكل
        </button>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 items-stretch">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col"
              onClick={() => navigate('/families')}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground line-clamp-1">
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

export default FamiliesStats;
