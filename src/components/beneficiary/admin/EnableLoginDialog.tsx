import { useState, useEffect } from "react";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";
import { Key, Mail, User, Info, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { logger } from "@/lib/logger";
import { nationalIdToEmail, generateSecurePassword } from "@/lib/beneficiaryAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { useLeakedPassword } from "@/hooks/useLeakedPassword";

interface EnableLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiary: {
    id: string;
    full_name: string;
    national_id: string;
    email?: string;
    username?: string;
    can_login?: boolean;
    user_id?: string;
  };
  onSuccess?: () => void;
}

export function EnableLoginDialog({ open, onOpenChange, beneficiary, onSuccess }: EnableLoginDialogProps) {
  
  const [loading, setLoading] = useState(false);
  const [hasExistingAuth, setHasExistingAuth] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { checkPasswordQuick } = useLeakedPassword();
  
  // توليد البريد وكلمة المرور تلقائياً من رقم الهوية
  const autoEmail = nationalIdToEmail(beneficiary.national_id);
  const tempPassword = generateSecurePassword();
  
  const [formData, setFormData] = useState({
    username: beneficiary.username || beneficiary.national_id,
    email: beneficiary.email || autoEmail,
    password: tempPassword,
    confirmPassword: tempPassword,
  });

  // فحص وجود حساب مصادقة
  useEffect(() => {
    setHasExistingAuth(!!beneficiary.user_id);
  }, [beneficiary.user_id]);

  // تفعيل حساب موجود (user_id موجود)
  const handleEnableExisting = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("beneficiaries")
        .update({ 
          can_login: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", beneficiary.id);

      if (error) throw error;

      toast({
        title: "تم التفعيل بنجاح",
        description: `تم تفعيل حساب ${beneficiary.full_name}`,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      logger.error(error, { context: 'enable_existing_account', severity: 'high' });
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء التفعيل';
      toast({
        title: "خطأ في التفعيل",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // إنشاء حساب جديد (user_id غير موجود)
  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // التحقق من كلمة المرور المسربة
      const isLeaked = await checkPasswordQuick(formData.password);
      if (isLeaked) {
        toast({
          title: "كلمة مرور غير آمنة",
          description: "هذه الكلمة تم تسريبها في اختراقات سابقة. يرجى اختيار كلمة مرور أخرى.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: beneficiary.full_name,
            beneficiary_id: beneficiary.id,
          },
          emailRedirectTo: `${window.location.origin}/beneficiary-dashboard`,
        },
      });

      if (authError) {
        let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
        let errorTitle = "خطأ في الإنشاء";
        
        // معالجة الأخطاء الشائعة برسائل واضحة
        if (authError.message.includes("already registered") || authError.message.includes("User already registered")) {
          errorTitle = "البريد الإلكتروني مستخدم";
          errorMessage = "هذا البريد الإلكتروني مسجل بالفعل. حاول استخدام بريد آخر.";
        } else if (authError.message.includes("Invalid email")) {
          errorTitle = "بريد إلكتروني غير صالح";
          errorMessage = "يرجى التأكد من صحة البريد الإلكتروني المدخل.";
        } else if (authError.message.includes("Password")) {
          errorTitle = "خطأ في كلمة المرور";
          errorMessage = "كلمة المرور يجب أن تكون على الأقل 6 أحرف وتحتوي على أحرف وأرقام.";
        } else if (authError.message.includes("Database")) {
          errorTitle = "خطأ في قاعدة البيانات";
          errorMessage = "حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.";
        } else {
          // رسالة عامة مع تفاصيل الخطأ
          errorMessage = `${errorMessage}: ${authError.message}`;
        }
        
        logger.error(authError, { 
          context: 'auth_signup_failed', 
          severity: 'high'
        });
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
        
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("beneficiaries")
        .update({
          username: formData.username,
          email: formData.email,
          can_login: true,
          login_enabled_at: new Date().toISOString(),
          user_id: authData.user?.id,
        })
        .eq("id", beneficiary.id);

      if (updateError) {
        logger.error(updateError, { 
          context: 'beneficiary_update_failed', 
          severity: 'critical'
        });
        
        toast({
          title: "خطأ في حفظ البيانات",
          description: "تم إنشاء حساب المصادقة لكن فشل ربطه بالمستفيد. يرجى التواصل مع الدعم الفني.",
          variant: "destructive",
        });
        
        setLoading(false);
        return;
      }

      if (authData.user) {
        try {
          await supabase.rpc('create_user_profile_and_role', {
            p_user_id: authData.user.id,
            p_full_name: beneficiary.full_name,
            p_email: formData.email,
            p_role: 'beneficiary'
          });
        } catch (roleError) {
          logger.error(roleError, { context: 'create_beneficiary_profile', severity: 'low' });
        }
      }

      toast({
        title: "تم التفعيل بنجاح",
        description: `تم إنشاء حساب ${beneficiary.full_name} بنجاح`,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      logger.error(error, { context: 'create_beneficiary_account', severity: 'high' });
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الحساب';
      toast({
        title: "خطأ في الإنشاء",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // تم نقل وظيفة إعادة تعيين كلمة المرور إلى ResetPasswordDialog

  const handleDisable = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("beneficiaries")
        .update({ 
          can_login: false,
          updated_at: new Date().toISOString()
        })
        .eq("id", beneficiary.id);

      if (error) throw error;

      toast({
        title: "تم التعطيل",
        description: "تم تعطيل حساب المستفيد",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'فشل تفعيل تسجيل الدخول';
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ResponsiveDialog 
        open={open} 
        onOpenChange={onOpenChange}
        title={beneficiary.can_login ? "إدارة حساب المستفيد" : "تفعيل حساب المستفيد"}
        size="md"
      >
        {beneficiary.can_login ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                هذا المستفيد لديه حساب نشط. يمكنك إعادة تعيين كلمة المرور أو تعطيل الحساب.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm"><strong>اسم المستخدم:</strong> {beneficiary.username || 'غير محدد'}</p>
              <p className="text-sm"><strong>رقم الهوية:</strong> {beneficiary.national_id}</p>
              {beneficiary.email && (
                <p className="text-sm"><strong>البريد الإلكتروني:</strong> {beneficiary.email}</p>
              )}
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                إلغاء
              </Button>
              <Button 
                type="button"
                variant="secondary"
                onClick={() => {
                  onOpenChange(false);
                  setShowResetPassword(true);
                }}
                className="w-full sm:w-auto"
              >
                <Key className="ml-2 h-4 w-4" />
                إعادة تعيين كلمة المرور
              </Button>
              <Button 
                type="button"
                variant="destructive" 
                onClick={handleDisable} 
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "جاري التعطيل..." : "تعطيل الحساب"}
              </Button>
            </DialogFooter>
          </div>
      ) : hasExistingAuth ? (
        // حساب معطل لكن user_id موجود
        <div className="space-y-4">
          <Alert className="bg-warning-light border-warning">
            <Info className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning-foreground">
              هذا الحساب معطل مؤقتاً. البيانات والمعلومات محفوظة ويمكن تفعيله مباشرة.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm"><strong>اسم المستخدم:</strong> {beneficiary.username || 'غير محدد'}</p>
            <p className="text-sm"><strong>البريد الإلكتروني:</strong> {beneficiary.email || 'غير محدد'}</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button 
              type="button"
              onClick={handleEnableExisting} 
              disabled={loading}
            >
              {loading ? "جاري التفعيل..." : "تفعيل الحساب"}
            </Button>
          </DialogFooter>
        </div>
      ) : (
        // إنشاء حساب جديد
        <form onSubmit={handleCreateNew} className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              سيتم إنشاء حساب جديد باستخدام المعلومات التالية
            </AlertDescription>
          </Alert>
          
          <Alert className="bg-primary/5 border-primary/20">
            <AlertDescription className="space-y-1">
              <p className="font-semibold">معلومات الدخول المؤقتة:</p>
              <p className="text-sm">• رقم الهوية: <code className="bg-background px-2 py-0.5 rounded">{beneficiary.national_id}</code></p>
              <p className="text-sm">• كلمة المرور: <code className="bg-background px-2 py-0.5 rounded">{tempPassword}</code></p>
              <p className="text-xs text-muted-foreground mt-2">سيُطلب من المستفيد تغيير كلمة المرور عند أول دخول</p>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="username">
              <User className="inline h-4 w-4 ml-1" />
              اسم المستخدم *
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="أدخل اسم المستخدم"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="inline h-4 w-4 ml-1" />
              البريد الإلكتروني *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="أدخل البريد الإلكتروني"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              <Key className="inline h-4 w-4 ml-1" />
              كلمة المرور *
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              <Key className="inline h-4 w-4 ml-1" />
              تأكيد كلمة المرور *
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="أعد إدخال كلمة المرور"
              required
              minLength={6}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
            </Button>
          </DialogFooter>
        </form>
      )}
      </ResponsiveDialog>
      
      <ResetPasswordDialog
        open={showResetPassword}
        onOpenChange={setShowResetPassword}
        beneficiary={beneficiary}
        onSuccess={onSuccess}
      />
    </>
  );
}
