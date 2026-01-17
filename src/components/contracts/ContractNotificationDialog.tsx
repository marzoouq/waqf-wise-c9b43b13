/**
 * حوار إرسال إشعار تعاقدي
 * يدعم أنواع متعددة من الإشعارات مع قوالب جاهزة
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Bell, 
  Mail,
  MessageSquare,
  Phone,
  Send,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { type Contract } from '@/hooks/property/useContracts';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const notificationSchema = z.object({
  notification_type: z.enum(['تجديد', 'إنهاء', 'تعديل_إيجار', 'مخالفة', 'تحصيل', 'تذكير', 'إنذار', 'أخرى']),
  title: z.string().min(1, 'العنوان مطلوب'),
  content: z.string().min(10, 'المحتوى يجب أن يكون 10 أحرف على الأقل'),
  delivery_email: z.boolean().default(true),
  delivery_sms: z.boolean().default(false),
  delivery_whatsapp: z.boolean().default(false),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

// قوالب الإشعارات الجاهزة
const notificationTemplates: Record<string, { title: string; content: string }> = {
  تجديد: {
    title: 'إشعار تجديد العقد',
    content: `السلام عليكم ورحمة الله وبركاته،

نود إشعاركم بقرب انتهاء عقد الإيجار الخاص بكم رقم {contract_number} بتاريخ {end_date}.

نرجو منكم التواصل معنا في أقرب وقت ممكن لتجديد العقد أو إخلاء الوحدة.

مع خالص التحية،
إدارة الوقف`,
  },
  إنهاء: {
    title: 'إشعار إنهاء العقد',
    content: `السلام عليكم ورحمة الله وبركاته،

نود إشعاركم بإنهاء عقد الإيجار رقم {contract_number}.

نرجو منكم تسليم الوحدة وإتمام إجراءات الإخلاء.

مع خالص التحية،
إدارة الوقف`,
  },
  تحصيل: {
    title: 'إشعار تحصيل متأخرات',
    content: `السلام عليكم ورحمة الله وبركاته،

نود تذكيركم بوجود مبالغ متأخرة على عقد الإيجار رقم {contract_number}.

نرجو منكم المبادرة بالسداد في أقرب وقت.

مع خالص التحية،
إدارة الوقف`,
  },
  إنذار: {
    title: 'إنذار رسمي',
    content: `السلام عليكم ورحمة الله وبركاته،

هذا إنذار رسمي بخصوص عقد الإيجار رقم {contract_number}.

نرجو منكم الالتزام بشروط العقد وإلا سنضطر لاتخاذ الإجراءات النظامية.

مع خالص التحية،
إدارة الوقف`,
  },
};

interface ContractNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
}

export function ContractNotificationDialog({
  open,
  onOpenChange,
  contract,
}: ContractNotificationDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      notification_type: 'تذكير',
      title: '',
      content: '',
      delivery_email: true,
      delivery_sms: false,
      delivery_whatsapp: false,
    },
  });

  const selectedType = form.watch('notification_type');

  // تطبيق القالب عند تغيير النوع
  const applyTemplate = (type: string) => {
    const template = notificationTemplates[type];
    if (template && contract) {
      const content = template.content
        .replace('{contract_number}', contract.contract_number)
        .replace('{end_date}', format(new Date(contract.end_date), 'yyyy/MM/dd', { locale: ar }))
        .replace('{tenant_name}', contract.tenant_name);
      
      form.setValue('title', template.title);
      form.setValue('content', content);
    }
  };

  const onSubmit = async (data: NotificationFormValues) => {
    if (!contract) return;

    setIsSubmitting(true);
    try {
      const deliveryMethods: string[] = [];
      if (data.delivery_email) deliveryMethods.push('email');
      if (data.delivery_sms) deliveryMethods.push('sms');
      if (data.delivery_whatsapp) deliveryMethods.push('whatsapp');

      const { error } = await supabase.from('contract_notifications').insert({
        contract_id: contract.id,
        notification_type: data.notification_type,
        title: data.title,
        content: data.content,
        delivery_method: deliveryMethods,
        status: 'مسودة',
        recipient_name: contract.tenant_name,
        recipient_email: contract.tenant_email,
        recipient_phone: contract.tenant_phone,
      });

      if (error) throw error;

      toast.success('تم حفظ الإشعار بنجاح');
      queryClient.invalidateQueries({ queryKey: ['contract-notifications'] });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving notification:', error);
      toast.error('حدث خطأ أثناء حفظ الإشعار');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            إرسال إشعار تعاقدي
          </DialogTitle>
          <DialogDescription>
            العقد: {contract.contract_number} | المستأجر: {contract.tenant_name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* نوع الإشعار */}
            <FormField
              control={form.control}
              name="notification_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الإشعار</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      applyTemplate(value);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الإشعار" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="تجديد">🔄 إشعار تجديد</SelectItem>
                      <SelectItem value="إنهاء">❌ إشعار إنهاء</SelectItem>
                      <SelectItem value="تعديل_إيجار">💰 تعديل إيجار</SelectItem>
                      <SelectItem value="مخالفة">⚠️ مخالفة</SelectItem>
                      <SelectItem value="تحصيل">💳 تحصيل متأخرات</SelectItem>
                      <SelectItem value="تذكير">📝 تذكير</SelectItem>
                      <SelectItem value="إنذار">🚨 إنذار رسمي</SelectItem>
                      <SelectItem value="أخرى">📄 أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* العنوان */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الإشعار</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل عنوان الإشعار" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* المحتوى */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>محتوى الإشعار</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل نص الإشعار..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* طرق الإرسال */}
            <Card>
              <CardContent className="pt-4">
                <FormLabel className="mb-3 block">طرق الإرسال</FormLabel>
                <div className="flex flex-wrap gap-4">
                  <FormField
                    control={form.control}
                    name="delivery_email"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="flex items-center gap-1 !mt-0 cursor-pointer">
                          <Mail className="h-4 w-4" />
                          البريد الإلكتروني
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delivery_sms"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="flex items-center gap-1 !mt-0 cursor-pointer">
                          <Phone className="h-4 w-4" />
                          رسالة نصية
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delivery_whatsapp"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="flex items-center gap-1 !mt-0 cursor-pointer">
                          <MessageSquare className="h-4 w-4" />
                          واتساب
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* معلومات المستلم */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">المستلم:</span>
                  <span className="font-medium">{contract.tenant_name}</span>
                </div>
                {contract.tenant_email && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">البريد:</span>
                    <span>{contract.tenant_email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الجوال:</span>
                  <span dir="ltr">{contract.tenant_phone}</span>
                </div>
              </CardContent>
            </Card>

            <DialogFooter className="gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ms-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 ms-2" />
                    حفظ الإشعار
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
