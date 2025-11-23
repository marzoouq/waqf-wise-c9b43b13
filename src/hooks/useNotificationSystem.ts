import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  channel?: 'app' | 'email' | 'sms' | 'all';
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Hook لإرسال إشعارات للمستخدمين
 */
export function useNotificationSystem() {
  const sendNotification = async (params: SendNotificationParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: params
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error('فشل إرسال الإشعار');
      return { success: false, error };
    }
  };

  /**
   * إرسال إشعار بإصدار فاتورة جديدة
   */
  const notifyInvoiceIssued = async (
    userId: string,
    invoiceNumber: string,
    amount: number
  ) => {
    return sendNotification({
      userId,
      title: 'فاتورة جديدة',
      message: `تم إصدار الفاتورة رقم ${invoiceNumber} بمبلغ ${amount.toFixed(2)} ريال`,
      type: 'info',
      actionUrl: '/invoices',
      channel: 'all',
      priority: 'medium',
    });
  };

  /**
   * إرسال تذكير باستحقاق دفعة
   */
  const notifyPaymentDue = async (
    userId: string,
    description: string,
    amount: number,
    dueDate: string
  ) => {
    return sendNotification({
      userId,
      title: 'تذكير: دفعة مستحقة',
      message: `لديك دفعة مستحقة: ${description} بمبلغ ${amount.toFixed(2)} ريال بتاريخ ${dueDate}`,
      type: 'warning',
      actionUrl: '/payments',
      channel: 'all',
      priority: 'high',
    });
  };

  /**
   * إرسال إشعار بالموافقة على طلب
   */
  const notifyRequestApproved = async (
    userId: string,
    requestType: string,
    requestNumber: string
  ) => {
    return sendNotification({
      userId,
      title: 'تمت الموافقة',
      message: `تمت الموافقة على ${requestType} رقم ${requestNumber}`,
      type: 'success',
      actionUrl: '/beneficiary/requests',
      channel: 'all',
      priority: 'medium',
    });
  };

  /**
   * إرسال إشعار برفض طلب
   */
  const notifyRequestRejected = async (
    userId: string,
    requestType: string,
    requestNumber: string,
    reason?: string
  ) => {
    return sendNotification({
      userId,
      title: 'تم رفض الطلب',
      message: `تم رفض ${requestType} رقم ${requestNumber}${reason ? `: ${reason}` : ''}`,
      type: 'error',
      actionUrl: '/beneficiary/requests',
      channel: 'all',
      priority: 'medium',
    });
  };

  /**
   * إرسال إشعار بتوزيع جديد
   */
  const notifyDistributionCreated = async (
    userId: string,
    amount: number,
    distributionDate: string
  ) => {
    return sendNotification({
      userId,
      title: 'توزيع جديد',
      message: `تم إنشاء توزيع بمبلغ ${amount.toFixed(2)} ريال بتاريخ ${distributionDate}`,
      type: 'success',
      actionUrl: '/distributions',
      channel: 'all',
      priority: 'high',
    });
  };

  return {
    sendNotification,
    notifyInvoiceIssued,
    notifyPaymentDue,
    notifyRequestApproved,
    notifyRequestRejected,
    notifyDistributionCreated,
  };
}
