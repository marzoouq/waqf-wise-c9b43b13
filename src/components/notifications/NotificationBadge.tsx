import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBadge() {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) {
    return (
      <div className="relative">
        <Bell className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      <Badge 
        variant="destructive" 
        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
      >
        {unreadCount > 9 ? '9+' : unreadCount}
      </Badge>
    </div>
  );
}
