import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Key, Monitor } from "lucide-react";
import { TwoFactorDialog } from "./TwoFactorDialog";
import { ActiveSessionsDialog } from "./ActiveSessionsDialog";
import { useChangePassword } from "@/hooks/auth/useChangePassword";

interface SecuritySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "كلمة المرور الحالية مطلوبة"),
  newPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function SecuritySettingsDialog({
  open,
  onOpenChange,
}: SecuritySettingsDialogProps) {
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  const [activeSessionsDialogOpen, setActiveSessionsDialogOpen] = useState(false);
  
  // استخدام hook مخصص لتغيير كلمة المرور
  const { changePassword, isLoading } = useChangePassword();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    const success = await changePassword(values.currentPassword, values.newPassword);
    if (success) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="الأمان والخصوصية"
      description="إدارة كلمة المرور وإعدادات الأمان"
      size="lg"
    >
      <div className="space-y-6">
          {/* تغيير كلمة المرور */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-4 w-4" />
                <h3 className="font-semibold">تغيير كلمة المرور</h3>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور الحالية</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="أدخل كلمة المرور الحالية"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور الجديدة</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="أدخل كلمة المرور الجديدة"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تأكيد كلمة المرور</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="أعد إدخال كلمة المرور الجديدة"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* المصادقة الثنائية */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4" />
                <h3 className="font-semibold">المصادقة الثنائية (2FA)</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                إضافة طبقة أمان إضافية لحسابك عن طريق المصادقة الثنائية
              </p>
              <Button 
                variant="outline"
                onClick={() => setTwoFactorDialogOpen(true)}
              >
                <Key className="h-4 w-4 ml-2" />
                إعداد المصادقة الثنائية
              </Button>
            </CardContent>
          </Card>

          {/* إدارة الجلسات النشطة */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="h-4 w-4" />
                <h3 className="font-semibold">الجلسات النشطة</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                عرض وإدارة جلسات تسجيل الدخول النشطة على جميع الأجهزة
              </p>
              <Button 
                variant="outline"
                onClick={() => setActiveSessionsDialogOpen(true)}
              >
                <Monitor className="h-4 w-4 ml-2" />
                إدارة الجلسات النشطة
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <TwoFactorDialog 
          open={twoFactorDialogOpen}
          onOpenChange={setTwoFactorDialogOpen}
        />
        <ActiveSessionsDialog
          open={activeSessionsDialogOpen}
          onOpenChange={setActiveSessionsDialogOpen}
        />
    </ResponsiveDialog>
  );
}
