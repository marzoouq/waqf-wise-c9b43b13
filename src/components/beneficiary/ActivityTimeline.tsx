import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Upload, LogIn, Send, CheckCircle } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useBeneficiaryActivity } from "@/hooks/beneficiary/useBeneficiaryActivity";

interface ActivityTimelineProps {
  beneficiaryId: string;
}

export function ActivityTimeline({ beneficiaryId }: ActivityTimelineProps) {
  const { activities, isLoading } = useBeneficiaryActivity(beneficiaryId);

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case "login":
        return <LogIn className="h-4 w-4" />;
      case "request_submitted":
        return <Send className="h-4 w-4" />;
      case "document_uploaded":
        return <Upload className="h-4 w-4" />;
      case "data_updated":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>سجل النشاط</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          سجل النشاط
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-3 relative">
                  {/* الخط الموصل */}
                  {index < activities.length - 1 && (
                    <div className="absolute right-[15px] top-8 w-[2px] h-full bg-border" />
                  )}
                  
                  {/* الأيقونة */}
                  <div className="relative z-10 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {getActivityIcon(activity.action_type)}
                  </div>
                  
                  {/* المحتوى */}
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-sm">{activity.action_description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.created_at || ""), "PPp", { locale: ar })}
                    </p>
                    {activity.performed_by_name && (
                      <p className="text-xs text-muted-foreground">
                        بواسطة: {activity.performed_by_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">لا توجد أنشطة مسجلة</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
