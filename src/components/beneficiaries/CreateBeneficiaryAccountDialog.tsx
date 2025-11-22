import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Copy, Eye, EyeOff } from "lucide-react";
import { Beneficiary } from "@/types/beneficiary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLeakedPassword } from "@/hooks/useLeakedPassword";

const accountSchema = z.object({
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface CreateBeneficiaryAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiary: Beneficiary;
  onSuccess?: () => void;
}

export function CreateBeneficiaryAccountDialog({ 
  open, 
  onOpenChange, 
  beneficiary,
  onSuccess 
}: CreateBeneficiaryAccountDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<{ email: string; password: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { checkPasswordQuick, isChecking } = useLeakedPassword();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    if (!beneficiary.email) {
      toast({
        title: "خطأ",
        description: "المستفيد لا يملك بريد إلكتروني",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // التحقق من كلمة المرور المسربة
      const isLeaked = await checkPasswordQuick(data.password);
      if (isLeaked) {
        toast({
          title: "كلمة مرور غير آمنة",
          description: "هذه الكلمة تم تسريبها في اختراقات سابقة. يرجى اختيار كلمة مرور أخرى.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: beneficiary.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: beneficiary.full_name,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update beneficiary with user_id
        const { error: updateError } = await supabase
          .from("beneficiaries")
          .update({ 
            user_id: authData.user.id,
            can_login: true,
            login_enabled_at: new Date().toISOString()
          })
          .eq("id", beneficiary.id);

        if (updateError) throw updateError;

        setCreatedAccount({
          email: beneficiary.email,
          password: data.password,
        });

        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "يمكن للمستفيد الآن تسجيل الدخول",
        });

        onSuccess?.();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الحساب";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ المعلومات إلى الحافظة",
    });
  };

  const handleClose = () => {
    setCreatedAccount(null);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            إنشاء حساب للمستفيد
          </DialogTitle>
          <DialogDescription>
            إنشاء حساب دخول للمستفيد: {beneficiary.full_name}
          </DialogDescription>
        </DialogHeader>

        {!createdAccount ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Alert>
                <AlertDescription className="text-sm">
                  <div className="space-y-1">
                    <p><strong>البريد الإلكتروني:</strong> {beneficiary.email}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      سيتم إنشاء حساب بهذا البريد الإلكتروني. تأكد من صحة البريد قبل المتابعة.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="أدخل كلمة المرور" 
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      يجب أن تكون 8 أحرف على الأقل
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تأكيد كلمة المرور *</FormLabel>
                    <FormControl>
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="أعد إدخال كلمة المرور" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isLoading || !beneficiary.email}>
                  إنشاء الحساب
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    ✅ تم إنشاء الحساب بنجاح!
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-background rounded border">
                      <div>
                        <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                        <p className="font-mono">{createdAccount.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(createdAccount.email)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-background rounded border">
                      <div>
                        <p className="text-xs text-muted-foreground">كلمة المرور</p>
                        <p className="font-mono">{createdAccount.password}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(createdAccount.password)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    ⚠️ احفظ هذه المعلومات الآن! لن تتمكن من رؤية كلمة المرور مرة أخرى.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    📧 تم إرسال رسالة تأكيد إلى البريد الإلكتروني. يمكن للمستفيد تسجيل الدخول مباشرة من صفحة تسجيل الدخول: <span className="font-mono">/auth</span>
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button onClick={handleClose}>
                إغلاق
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
