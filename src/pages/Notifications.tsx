import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bell, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";

const Notifications = () => {
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    isMarkingAllAsRead 
  } = useNotifications();

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  if (isLoading) {
    return <LoadingState message="جاري تحميل الإشعارات..." />;
  }

  return (
    <PageErrorBoundary pageName="الإشعارات">
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  الإشعارات
                </CardTitle>
                <CardDescription>
                  {unreadCount > 0 
                    ? `لديك ${unreadCount} إشعار غير مقروء`
                    : "جميع الإشعارات مقروءة"
                  }
                </CardDescription>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => markAllAsRead()}
                  disabled={isMarkingAllAsRead}
                >
                  <Check className="w-4 h-4 ml-2" />
                  تعليم الكل كمقروء
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  الكل ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  غير مقروءة ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="read">
                  مقروءة ({readNotifications.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {notifications.length === 0 ? (
                  <EmptyState
                    icon={Bell}
                    title="لا توجد إشعارات"
                    description="سيتم عرض جميع الإشعارات هنا"
                  />
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unread" className="mt-4">
                {unreadNotifications.length === 0 ? (
                  <EmptyState
                    icon={Check}
                    title="لا توجد إشعارات غير مقروءة"
                    description="جميع الإشعارات مقروءة"
                  />
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    {unreadNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="read" className="mt-4">
                {readNotifications.length === 0 ? (
                  <EmptyState
                    icon={Bell}
                    title="لا توجد إشعارات مقروءة"
                    description="لم تقرأ أي إشعارات بعد"
                  />
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    {readNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageErrorBoundary>
  );
};

export default Notifications;
