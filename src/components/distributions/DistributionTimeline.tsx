import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, XCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  timestamp?: string;
  user?: string;
  metadata?: Record<string, any>;
}

interface DistributionTimelineProps {
  distributionId: string;
  events: TimelineEvent[];
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
    label: 'مكتمل',
  },
  in_progress: {
    icon: Clock,
    color: 'text-info',
    bgColor: 'bg-info/10',
    label: 'جاري',
  },
  pending: {
    icon: Circle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    label: 'معلق',
  },
  failed: {
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    label: 'فشل',
  },
};

export function DistributionTimeline({ distributionId, events }: DistributionTimelineProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">مسار التوزيع</h3>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute right-[19px] top-2 bottom-2 w-0.5 bg-border" />

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const config = statusConfig[event.status];
            const Icon = config.icon;

            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div className={`relative z-10 ${config.bgColor} rounded-full p-2`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      {event.timestamp && (
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.timestamp), 'PPp', { locale: ar })}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">{config.label}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>

                  {event.user && (
                    <p className="text-xs text-muted-foreground">بواسطة: {event.user}</p>
                  )}

                  {/* Metadata */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-muted-foreground">{key}: </span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = events.filter(e => e.status === status).length;
            if (count === 0) return null;

            return (
              <div key={status} className="text-center">
                <div className={`text-2xl font-bold ${config.color}`}>{count}</div>
                <div className="text-sm text-muted-foreground">{config.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
