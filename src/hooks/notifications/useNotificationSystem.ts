/**
 * useNotificationSystem Hook - نظام الإشعارات
 * يستخدم EdgeFunctionService
 */
import { toast } from "sonner";
import { productionLogger } from "@/lib/logger/production-logger";
import { EdgeFunctionService } from "@/services";

interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  channel?: 'app' | 'email' | 'sms' | 'all';
  priority?: 'low' | 'medium' | 'high';
}

export function useNotificationSystem() {
  const sendNotification = async (params: SendNotificationParams) => {
    try {
      const data = await EdgeFunctionService.invoke('send-notification', params);
      return { success: true, data };
    } catch (error) {
      productionLogger.error('Failed to send notification:', error);
      toast.error('فشل إرسال الإشعار');
      return { success: false, error };
    }
  };

  const notifyInvoiceIssued = async (userId: string, invoiceNumber: string, amount: number) => {
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

  const notifyPaymentDue = async (userId: string, description: string, amount: number, dueDate: string) => {
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

  const notifyRequestApproved = async (userId: string, requestType: string, requestNumber: string) => {
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

  const notifyRequestRejected = async (userId: string, requestType: string, requestNumber: string, reason?: string) => {
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

  const notifyDistributionCreated = async (userId: string, amount: number, distributionDate: string) => {
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
