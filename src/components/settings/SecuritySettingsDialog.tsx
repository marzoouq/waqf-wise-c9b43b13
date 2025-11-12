import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Key } from "lucide-react";
import { TwoFactorDialog } from "./TwoFactorDialog";

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      setIsLoading(true);
      
      // Step 1: Verify current password by attempting sign in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('User not found');
      
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.currentPassword,
      });
      
      if (verifyError) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }
      
      // Step 2: Update to new password
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (error) throw error;

      toast({
        title: "تم تحديث كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح",
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="security-description">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5" />
            الأمان والخصوصية
          </DialogTitle>
          <DialogDescription id="security-description">
            إدارة كلمة المرور وإعدادات الأمان
          </DialogDescription>
        </DialogHeader>

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
        </div>
        
        <TwoFactorDialog 
          open={twoFactorDialogOpen}
          onOpenChange={setTwoFactorDialogOpen}
        />
      </DialogContent>
    </Dialog>
  );
}
