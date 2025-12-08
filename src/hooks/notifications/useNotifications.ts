import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationService, RealtimeService } from "@/services";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      return NotificationService.markAllAsRead(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("تم تعليم جميع الإشعارات كمقروءة");
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Show toast notification
          toast.info(newNotification.title, {
            description: newNotification.message,
            duration: 5000,
          });

          // Invalidate query to refetch
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Subscribe to changes in related tables
  useEffect(() => {
    const approvalsChannel = supabase
      .channel("approvals-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "approvals",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["approvals"] });
        }
      )
      .subscribe();

    const paymentsChannel = supabase
      .channel("payments-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "payments",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["payments"] });
        }
      )
      .subscribe();

    const journalChannel = supabase
      .channel("journal-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "journal_entries",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(approvalsChannel);
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(journalChannel);
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
