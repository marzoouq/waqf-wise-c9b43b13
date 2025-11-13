import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Key, Mail, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnableLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiary: {
    id: string;
    full_name: string;
    email?: string;
    username?: string;
    can_login?: boolean;
  };
  onSuccess?: () => void;
}

export function EnableLoginDialog({ open, onOpenChange, beneficiary, onSuccess }: EnableLoginDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: beneficiary.username || "",
    email: beneficiary.email || "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
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
      // 1. إنشاء حساب في Supabase Auth
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
        if (authError.message.includes("already registered")) {
          toast({
            title: "البريد الإلكتروني مستخدم",
            description: "هذا البريد الإلكتروني مسجل بالفعل",
            variant: "destructive",
          });
        } else {
          throw authError;
        }
        return;
      }

      // 2. تحديث بيانات المستفيد مباشرة
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

      if (updateError) throw updateError;

      // 3. إنشاء Profile و دور beneficiary
      if (authData.user) {
        try {
          // إنشاء Profile
          await supabase.rpc('create_user_profile_and_role', {
            p_user_id: authData.user.id,
            p_full_name: beneficiary.full_name,
            p_email: formData.email,
            p_role: 'beneficiary'
          });
        } catch (roleError) {
          console.error("Profile/Role creation error:", roleError);
        }
      }

      toast({
        title: "تم التفعيل بنجاح",
        description: `تم تفعيل حساب ${beneficiary.full_name} بنجاح`,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error enabling login:", error);
      toast({
        title: "خطأ في التفعيل",
        description: error.message || "حدث خطأ أثناء تفعيل الحساب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {beneficiary.can_login ? "تعطيل" : "تفعيل"} حساب المستفيد
          </DialogTitle>
        </DialogHeader>

        {beneficiary.can_login ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                هذا المستفيد لديه حساب نشط. يمكنك تعطيل الحساب لمنع الدخول.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <p className="text-sm"><strong>اسم المستخدم:</strong> {beneficiary.username}</p>
              <p className="text-sm"><strong>البريد الإلكتروني:</strong> {beneficiary.email}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert>
              <AlertDescription>
                سيتم إنشاء حساب للمستفيد للدخول إلى لوحة التحكم الخاصة به
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
          </form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            إلغاء
          </Button>
          {beneficiary.can_login ? (
            <Button variant="destructive" onClick={handleDisable} disabled={loading}>
              {loading ? "جاري التعطيل..." : "تعطيل الحساب"}
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "جاري التفعيل..." : "تفعيل الحساب"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
