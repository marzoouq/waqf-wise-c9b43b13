import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Activity, User, DollarSign, FileText, Settings, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityLog {
  id: string;
  action_type: string;
  action_description: string;
  performed_by_name: string | null;
  created_at: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
}

interface BeneficiaryActivityTimelineProps {
  beneficiaryId: string;
}

/**
 * سجل نشاط المستفيد المحسّن - المرحلة 2
 * عرض زمني تفاعلي لجميع الأنشطة
 */
export function BeneficiaryActivityTimeline({ beneficiaryId }: BeneficiaryActivityTimelineProps) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['beneficiary-activity', beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiary_activity_log')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ActivityLog[];
    },
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="لا توجد أنشطة"
        description="لم يتم تسجيل أي نشاط لهذا المستفيد بعد"
      />
    );
  }

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'create':
      case 'register':
        return <User className="h-4 w-4" />;
      case 'update':
      case 'edit':
        return <Settings className="h-4 w-4" />;
      case 'payment':
      case 'disbursement':
        return <DollarSign className="h-4 w-4" />;
      case 'document':
      case 'attachment':
        return <FileText className="h-4 w-4" />;
      case 'status_change':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (actionType: string) => {
    switch (actionType) {
      case 'create':
      case 'register':
        return 'bg-green-500';
      case 'update':
      case 'edit':
        return 'bg-blue-500';
      case 'payment':
      case 'disbursement':
        return 'bg-emerald-500';
      case 'delete':
      case 'suspend':
        return 'bg-red-500';
      case 'status_change':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `منذ ${diffInMinutes} دقيقة`;
      }
      return `منذ ${diffInHours} ساعة`;
    } else if (diffInHours < 48) {
      return 'أمس';
    } else {
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          سجل النشاط
        </CardTitle>
        <CardDescription>
          جميع الأنشطة والتغييرات على حساب المستفيد ({activities.length} نشاط)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {/* خط التوصيل */}
              {index !== activities.length - 1 && (
                <div className="absolute top-8 right-4 bottom-0 w-0.5 bg-border" />
              )}

              <div className="flex gap-4">
                {/* أيقونة النشاط */}
                <div className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-white",
                  getActivityColor(activity.action_type)
                )}>
                  {getActivityIcon(activity.action_type)}
                </div>

                {/* محتوى النشاط */}
                <div className="flex-1 space-y-2 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action_description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {activity.performed_by_name || 'النظام'}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {activity.action_type}
                    </Badge>
                  </div>

                  {/* تفاصيل التغييرات */}
                  {(activity.old_values || activity.new_values) && (
                    <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-2">
                      {activity.old_values && (
                        <div>
                          <span className="font-medium text-muted-foreground">القيم القديمة:</span>
                          <pre className="mt-1 text-xs overflow-x-auto">
                            {JSON.stringify(activity.old_values, null, 2)}
                          </pre>
                        </div>
                      )}
                      {activity.new_values && (
                        <div>
                          <span className="font-medium text-muted-foreground">القيم الجديدة:</span>
                          <pre className="mt-1 text-xs overflow-x-auto">
                            {JSON.stringify(activity.new_values, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
