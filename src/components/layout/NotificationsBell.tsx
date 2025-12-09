import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { LoadingState } from "@/components/shared/LoadingState";
import { useNavigate } from "react-router-dom";
import { memo, useCallback, useState } from "react";
import { RealtimeNotification } from "@/types/notifications";

export const NotificationsBell = memo(function NotificationsBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  // useNotifications already handles Realtime subscriptions internally
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    isMarkingAllAsRead 
  } = useNotifications();

  const handleNotificationClick = useCallback((notification: RealtimeNotification) => {
    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  }, [navigate]);

  const handleViewAll = useCallback(() => {
    navigate("/notifications");
    setIsOpen(false);
  }, [navigate]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label={`الإشعارات${unreadCount > 0 ? ` - ${unreadCount} غير مقروءة` : ''}`}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <h3 className="font-semibold text-sm sm:text-base">الإشعارات</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
              className="h-7 sm:h-8 text-xs"
            >
              <Check className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              <span className="hidden sm:inline">تعليم الكل كمقروء</span>
              <span className="sm:hidden">الكل مقروء</span>
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="p-4">
            <LoadingState message="جاري تحميل الإشعارات..." />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-muted-foreground">
            <Bell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">لا توجد إشعارات</p>
          </div>
        ) : (
          <ScrollArea className="h-72 sm:h-96">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </ScrollArea>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={handleViewAll}
              >
                عرض جميع الإشعارات
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
