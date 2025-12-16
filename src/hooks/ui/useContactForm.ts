/**
 * Hook لإرسال رسائل نموذج الاتصال
 * Contact Form Hook
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { NotificationService } from "@/services";

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

/**
 * Hook لإرسال نموذج الاتصال
 */
export function useContactForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: ContactFormData) => {
      // إرسال إشعارات للمسؤولين عبر الخدمة
      await NotificationService.sendContactNotifications(formData);
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
