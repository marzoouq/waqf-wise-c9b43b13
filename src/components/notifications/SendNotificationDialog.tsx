/**
 * SendNotificationDialog - حوار إرسال إشعار يدوي للمشرفين
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Users, User, Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const notificationSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  message: z.string().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل"),
  type: z.enum(["info", "success", "warning", "error"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  targetType: z.enum(["all", "specific"]),
  userId: z.string().optional(),
  actionUrl: z.string().optional(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const notificationTypes = [
  { value: "info", label: "معلومات", icon: Info, color: "text-blue-500" },
  { value: "success", label: "نجاح", icon: CheckCircle, color: "text-green-500" },
  { value: "warning", label: "تحذير", icon: AlertTriangle, color: "text-yellow-500" },
  { value: "error", label: "خطأ", icon: Bell, color: "text-red-500" },
];

const priorityLevels = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عالية" },
  { value: "urgent", label: "عاجلة" },
];

export function SendNotificationDialog({ open, onOpenChange }: SendNotificationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "info",
      priority: "medium",
      targetType: "all",
      userId: "",
      actionUrl: "",
    },
  });

  const targetType = form.watch("targetType");

  // جلب قائمة المستفيدين الذين لديهم user_id
  const { data: beneficiaries } = useQuery({
    queryKey: ["beneficiaries-with-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("id, full_name, user_id")
        .not("user_id", "is", null)
        .order("full_name");
      
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const sendNotification = useMutation({
    mutationFn: async (values: NotificationFormData) => {
      if (values.targetType === "all") {
        // إرسال لجميع المستفيدين
        const userIds = beneficiaries?.map(b => b.user_id).filter(Boolean) || [];
        
        if (userIds.length === 0) {
          throw new Error("لا يوجد مستفيدين لإرسال الإشعارات لهم");
        }

        const notifications = userIds.map(userId => ({
          user_id: userId,
          title: values.title,
          message: values.message,
          type: values.type,
          priority: values.priority,
          action_url: values.actionUrl || null,
        }));

        const { error } = await supabase
          .from("notifications")
          .insert(notifications);

        if (error) throw error;
        return { count: userIds.length };
      } else {
        // إرسال لمستفيد محدد
        if (!values.userId) {
          throw new Error("يرجى اختيار المستفيد");
        }

        const { error } = await supabase
          .from("notifications")
          .insert({
            user_id: values.userId,
            title: values.title,
            message: values.message,
            type: values.type,
            priority: values.priority,
            action_url: values.actionUrl || null,
          });

        if (error) throw error;
        return { count: 1 };
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم الإرسال بنجاح ✓",
        description: `تم إرسال الإشعار إلى ${data.count} مستخدم`,
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "فشل الإرسال",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: NotificationFormData) => {
    setIsSending(true);
    try {
      await sendNotification.mutateAsync(values);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            إرسال إشعار
          </DialogTitle>
          <DialogDescription>
            إرسال إشعار لجميع المستفيدين أو لمستفيد محدد
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* الهدف */}
            <FormField
              control={form.control}
              name="targetType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>إرسال إلى</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all" className="flex items-center gap-1 cursor-pointer">
                          <Users className="h-4 w-4" />
                          جميع المستفيدين ({beneficiaries?.length || 0})
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="specific" id="specific" />
                        <Label htmlFor="specific" className="flex items-center gap-1 cursor-pointer">
                          <User className="h-4 w-4" />
                          مستفيد محدد
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* اختيار المستفيد */}
            {targetType === "specific" && (
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المستفيد</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المستفيد" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {beneficiaries?.filter((b) => b.user_id).map((b) => (
                          <SelectItem key={b.id} value={b.user_id!}>
                            {b.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* العنوان */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Input placeholder="عنوان الإشعار" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* الرسالة */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الرسالة</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="نص الإشعار..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* النوع */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>النوع</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {notificationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <type.icon className={`h-4 w-4 ${type.color}`} />
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* الأولوية */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الأولوية</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* رابط الإجراء (اختياري) */}
            <FormField
              control={form.control}
              name="actionUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رابط الإجراء (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="/beneficiary/distributions" {...field} />
                  </FormControl>
                  <FormDescription>
                    الصفحة التي سينتقل إليها المستخدم عند الضغط على الإشعار
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <>جاري الإرسال...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 ms-2" />
                    إرسال الإشعار
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
