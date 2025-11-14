import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Badge } from "@/components/ui/badge";

export function PushNotificationsSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            الإشعارات الفورية
          </CardTitle>
          <CardDescription>
            المتصفح الحالي لا يدعم الإشعارات الفورية
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          الإشعارات الفورية
        </CardTitle>
        <CardDescription>
          تلقي إشعارات فورية عند حدوث أحداث مهمة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">حالة الإشعارات</p>
            <p className="text-sm text-muted-foreground">
              {permission === 'granted' && 'مفعلة'}
              {permission === 'denied' && 'محظورة'}
              {permission === 'default' && 'غير مفعلة'}
            </p>
          </div>
          <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
            {permission === 'granted' && 'مفعل'}
            {permission === 'denied' && 'محظور'}
            {permission === 'default' && 'غير مفعل'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">الاشتراك</p>
            <p className="text-sm text-muted-foreground">
              {isSubscribed ? 'مشترك في الإشعارات الفورية' : 'غير مشترك'}
            </p>
          </div>
          <Badge variant={isSubscribed ? 'default' : 'secondary'}>
            {isSubscribed ? 'مشترك' : 'غير مشترك'}
          </Badge>
        </div>

        <div className="flex gap-2">
          {!isSubscribed ? (
            <>
              {permission !== 'granted' && (
                <Button
                  onClick={requestPermission}
                  disabled={isLoading}
                  variant="outline"
                >
                  <Bell className="h-4 w-4 ml-2" />
                  طلب الإذن
                </Button>
              )}
              <Button
                onClick={subscribe}
                disabled={isLoading || permission === 'denied'}
              >
                <Bell className="h-4 w-4 ml-2" />
                تفعيل الإشعارات
              </Button>
            </>
          ) : (
            <Button
              onClick={unsubscribe}
              disabled={isLoading}
              variant="destructive"
            >
              <BellOff className="h-4 w-4 ml-2" />
              إلغاء الاشتراك
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
