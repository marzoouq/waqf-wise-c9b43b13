import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Upload, LogIn, Send, CheckCircle } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";

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

  // عرض آخر 3 أنشطة فقط
  const recentActivities = activities?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">سجل النشاط</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-muted">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          سجل النشاط
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {recentActivities.length > 0 ? (
          <div className="space-y-2">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                {/* الأيقونة */}
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {getActivityIcon(activity.action_type)}
                </div>
                
                {/* المحتوى */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs truncate">{activity.action_description}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(activity.created_at || ""), "d MMM - h:mm a", { locale: ar })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm py-4">لا توجد أنشطة</p>
        )}
      </CardContent>
    </Card>
  );
}
