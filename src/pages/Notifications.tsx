import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bell, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";

const Notifications = () => {
  const { 
    notifications, 
    isLoading, 
    error,
    refetch,
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

  if (error) {
    return (
      <ErrorState 
        title="فشل تحميل الإشعارات" 
        message="حدث خطأ أثناء تحميل الإشعارات"
        onRetry={() => refetch?.()}
        fullScreen
      />
    );
  }

  return (
    <PageErrorBoundary pageName="الإشعارات">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="الإشعارات"
          description={unreadCount > 0 
            ? `لديك ${unreadCount} إشعار غير مقروء`
            : "جميع الإشعارات مقروءة"
          }
          icon={<Bell className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
          actions={
            unreadCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllAsRead}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">تعليم الكل كمقروء</span>
                <span className="sm:hidden">تعليم الكل</span>
              </Button>
            ) : null
          }
        />

        <Card>
          <CardContent className="p-2 sm:p-6">
            <Tabs defaultValue="all" className="w-full">
              <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 pb-2">
                <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-3 gap-1 h-auto min-w-full sm:min-w-0 mb-4">
                  <TabsTrigger value="all" className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm">
                    الكل ({notifications.length})
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm">
                    غير مقروءة ({unreadCount})
                  </TabsTrigger>
                  <TabsTrigger value="read" className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm">
                    مقروءة ({readNotifications.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-4">
                {notifications.length === 0 ? (
                  <EmptyState
                    icon={Bell}
                    title="لا توجد إشعارات"
                    description="سيتم عرض جميع الإشعارات هنا"
                  />
                ) : (
                  <div className="border rounded-lg overflow-hidden divide-y">
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
                  <div className="border rounded-lg overflow-hidden divide-y">
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
                  <div className="border rounded-lg overflow-hidden divide-y">
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
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Notifications;
