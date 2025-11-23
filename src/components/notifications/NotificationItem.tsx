import { Bell, CheckCircle, AlertCircle, DollarSign, FileText, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Notification } from "@/hooks/useNotifications";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick?: () => void;
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "approval":
      return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success" />;
    case "payment":
      return <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-info" />;
    case "journal_entry":
      return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />;
    case "distribution":
      return <Users className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />;
    case "system":
      return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />;
    default:
      return <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />;
  }
};

const getNotificationBg = (type: Notification["type"]) => {
  switch (type) {
    case "approval":
      return "bg-success-light dark:bg-success/10";
    case "payment":
      return "bg-info-light dark:bg-info/10";
    case "journal_entry":
      return "bg-accent/10 dark:bg-accent/5";
    case "distribution":
      return "bg-warning-light dark:bg-warning/10";
    case "system":
      return "bg-warning-light dark:bg-warning/10";
    default:
      return "bg-muted";
  }
};

export const NotificationItem = ({ notification, onMarkAsRead, onClick }: NotificationItemProps) => {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3 sm:p-4 hover:bg-accent cursor-pointer transition-colors border-b last:border-b-0",
        !notification.is_read && "bg-accent/50"
      )}
    >
      <div className="flex gap-2 sm:gap-3">
        <div className={cn("p-1.5 sm:p-2 rounded-full h-fit", getNotificationBg(notification.type))}>
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "text-xs sm:text-sm font-medium",
              !notification.is_read && "font-semibold"
            )}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: ar,
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
