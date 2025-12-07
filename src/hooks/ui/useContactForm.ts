/**
 * Hook لإرسال رسائل نموذج الاتصال
 * Contact Form Hook
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface NotificationInsert {
  user_id: string;
  title: string;
  message: string;
  type: 'info';
  priority: string;
  reference_type: string;
  action_url: string;
  is_read: boolean;
}

/**
 * إرسال إشعارات للمسؤولين
 */
async function notifyAdmins(formData: ContactFormData): Promise<void> {
  // جلب المسؤولين
  const { data: adminUsers } = await supabase
    .from('user_roles')
    .select('user_id')
    .in('role', ['admin', 'nazer']);

  if (adminUsers && adminUsers.length > 0) {
    const notificationData: NotificationInsert[] = adminUsers.map(admin => ({
      user_id: admin.user_id,
      title: `رسالة جديدة: ${formData.subject}`,
      message: `رسالة من ${formData.name}: ${formData.subject}`,
      type: 'info' as const,
      priority: 'medium',
      reference_type: 'contact_message',
      action_url: '/admin/messages',
      is_read: false,
    }));

    if (notificationData.length > 0) {
      await supabase.from('notifications').insert(notificationData);
    }
  }
}

/**
 * Hook لإرسال نموذج الاتصال
 */
export function useContactForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: ContactFormData) => {
      // إرسال إشعارات للمسؤولين
      await notifyAdmins(formData);
      return formData;
    },
    onSuccess: () => {
      toast({
        title: "تم الإرسال",
        description: "تم إرسال رسالتك بنجاح، سنتواصل معك قريباً",
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الرسالة",
        variant: "destructive",
      });
    }
  });

  return {
    sendMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}
