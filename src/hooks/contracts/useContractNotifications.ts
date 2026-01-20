/**
 * Hook لإدارة الإشعارات التعاقدية
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { matchesStatus } from '@/lib/constants';

export interface ContractNotification {
  id: string;
  contract_id: string;
  notification_type: string;
  title: string;
  content: string;
  delivery_method: string[];
  status: string;
  sent_at: string | null;
  read_at: string | null;
  created_by: string | null;
  created_at: string;
}

export type NotificationType = 
  | 'تجديد'
  | 'إنهاء'
  | 'تعديل_إيجار'
  | 'مخالفة'
  | 'تحصيل'
  | 'تذكير'
  | 'أخرى';

export type DeliveryMethod = 'email' | 'sms' | 'whatsapp' | 'in_app';

export type NotificationStatus = 'draft' | 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export function useContractNotifications(contractId?: string) {
  const queryClient = useQueryClient();

  // جلب جميع الإشعارات
  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['contract-notifications', contractId],
    queryFn: async () => {
      let query = supabase
        .from('contract_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (contractId) {
        query = query.eq('contract_id', contractId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContractNotification[];
    },
  });

  // إنشاء إشعار جديد
  const createNotification = useMutation({
    mutationFn: async (notification: {
      contract_id: string;
      notification_type: NotificationType;
      title: string;
      content: string;
      delivery_method: DeliveryMethod[];
    }) => {
      const { data, error } = await supabase
        .from('contract_notifications')
        .insert({
          ...notification,
          status: 'pending',
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-notifications'] });
      toast.success('تم إنشاء الإشعار بنجاح');
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      toast.error('حدث خطأ أثناء إنشاء الإشعار');
    },
  });

  // إرسال إشعار
  const sendNotification = useMutation({
    mutationFn: async (id: string) => {
      // هنا يمكن إضافة منطق الإرسال الفعلي (email, sms, etc.)
      const { data, error } = await supabase
        .from('contract_notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-notifications'] });
      toast.success('تم إرسال الإشعار بنجاح');
    },
    onError: (error) => {
      console.error('Error sending notification:', error);
      toast.error('حدث خطأ أثناء إرسال الإشعار');
    },
  });

  // تحديث حالة الإشعار
  const updateNotificationStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: NotificationStatus;
    }) => {
      const updates: Partial<ContractNotification> = { status };
      
      if (status === 'read') {
        updates.read_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('contract_notifications')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-notifications'] });
    },
    onError: (error) => {
      console.error('Error updating notification status:', error);
      toast.error('حدث خطأ أثناء تحديث الحالة');
    },
  });

  // حذف إشعار
  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contract_notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-notifications'] });
      toast.success('تم حذف الإشعار');
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast.error('حدث خطأ أثناء حذف الإشعار');
    },
  });

  // إحصائيات الإشعارات
  const stats = {
    total: notifications?.length || 0,
    pending: notifications?.filter((n) => matchesStatus(n.status, 'pending')).length || 0,
    sent: notifications?.filter((n) => matchesStatus(n.status, 'sent')).length || 0,
    delivered: notifications?.filter((n) => matchesStatus(n.status, 'delivered')).length || 0,
    read: notifications?.filter((n) => matchesStatus(n.status, 'read')).length || 0,
    failed: notifications?.filter((n) => matchesStatus(n.status, 'failed')).length || 0,
  };

  return {
    notifications,
    isLoading,
    error,
    refetch,
    createNotification,
    sendNotification,
    updateNotificationStatus,
    deleteNotification,
    stats,
  };
}
