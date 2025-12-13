import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationService, RealtimeService, AuthService } from "@/services";
import { useEffect } from "react";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'approval' | 'payment' | 'journal_entry' | 'distribution' | 'system';
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  action_url: string | null;
  channel?: string;
  sent_at?: string | null;
  delivery_status?: string;
  scheduled_for?: string | null;
  retry_count?: number;
  error_message?: string | null;
}

export const useNotifications = () => {
  const queryClient = useQueryClient();

  // Fetch notifications - get user inside query
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS,
    queryFn: async () => {
      const user = await AuthService.getCurrentUser();
      if (!user) return [];
      return NotificationService.getUserNotifications(user.id);
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => NotificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error("User not authenticated");
      return NotificationService.markAllAsRead(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
      toast.success("تم تعليم جميع الإشعارات كمقروءة");
    },
  });

  // Real-time subscription for notifications
  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable(
      "notifications",
      () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Subscribe to changes in related tables
  useEffect(() => {
    const subscription = RealtimeService.subscribeToChanges(
      ["approvals", "payments", "journal_entries"],
      (payload) => {
        if (payload.table === 'approvals') {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVALS });
        } else if (payload.table === 'payments') {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS });
        } else if (payload.table === 'journal_entries') {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL_ENTRIES });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};
