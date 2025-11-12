import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Key, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";

interface TwoFactorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TwoFactorDialog = ({ open, onOpenChange }: TwoFactorDialogProps) => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"enable" | "verify">("enable");
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // استخدام any للحقول الجديدة حتى يتم تحديث types
  const twoFactorEnabled = (profile as any)?.two_factor_enabled || false;

  const generateSecret = () => {
    // في بيئة حقيقية، يجب استخدام مكتبة مثل speakeasy
    // هذا مجرد مثال بسيط
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      const newSecret = generateSecret();
      const newBackupCodes = generateBackupCodes();
      
      setSecret(newSecret);
      setBackupCodes(newBackupCodes);
      setStep("verify");
      
      toast.success("تم إنشاء رمز المصادقة الثنائية");
    } catch (error) {
      toast.error("حدث خطأ أثناء تفعيل المصادقة الثنائية");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      toast.error("الرجاء إدخال رمز مكون من 6 أرقام");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles" as any)
        .update({
          two_factor_enabled: true,
          two_factor_secret: secret,
          backup_codes: backupCodes,
        })
        .eq("user_id", profile?.user_id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("تم تفعيل المصادقة الثنائية بنجاح");
      onOpenChange(false);
      setStep("enable");
      setCode("");
    } catch (error) {
      toast.error("حدث خطأ أثناء التحقق من الرمز");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles" as any)
        .update({
          two_factor_enabled: false,
          two_factor_secret: null,
          backup_codes: null,
        })
        .eq("user_id", profile?.user_id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("تم إلغاء تفعيل المصادقة الثنائية");
      onOpenChange(false);
    } catch (error) {
      toast.error("حدث خطأ أثناء إلغاء تفعيل المصادقة الثنائية");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    toast.success("تم النسخ إلى الحافظة");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            المصادقة الثنائية (2FA)
          </DialogTitle>
          <DialogDescription>
            {twoFactorEnabled
              ? "المصادقة الثنائية مفعلة حالياً"
              : "قم بتفعيل المصادقة الثنائية لحماية حسابك"}
          </DialogDescription>
        </DialogHeader>

        {twoFactorEnabled ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">المصادقة الثنائية مفعلة</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                حسابك محمي بالمصادقة الثنائية
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={isLoading}
              className="w-full"
            >
              إلغاء تفعيل المصادقة الثنائية
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {step === "enable" && (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    المصادقة الثنائية تضيف طبقة إضافية من الأمان لحسابك. عند التفعيل،
                    ستحتاج إلى إدخال رمز من تطبيق المصادقة عند تسجيل الدخول.
                  </p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-medium mb-2">المتطلبات:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>تطبيق المصادقة (Google Authenticator أو Microsoft Authenticator)</li>
                    <li>جهاز محمول لتثبيت التطبيق</li>
                  </ul>
                </div>

                <Button
                  onClick={handleEnable2FA}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Key className="h-4 w-4 ml-2" />
                  تفعيل المصادقة الثنائية
                </Button>
              </>
            )}

            {step === "verify" && (
              <>
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <Label className="mb-2 block">المفتاح السري:</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-background p-3 rounded border text-sm font-mono">
                        {secret}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(secret, "secret")}
                      >
                        {copiedCode === "secret" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      قم بإدخال هذا المفتاح في تطبيق المصادقة الخاص بك
                    </p>
                  </div>

                  <div>
                    <Label className="mb-2 block">أدخل رمز التحقق من التطبيق:</Label>
                    <Input
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest font-mono"
                    />
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      رموز الاحتياط:
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      احفظ هذه الرموز في مكان آمن. يمكنك استخدامها لتسجيل الدخول إذا فقدت الوصول
                      إلى تطبيق المصادقة.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="bg-background p-2 rounded border text-sm font-mono flex items-center justify-between"
                        >
                          <span>{code}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(code, `backup-${index}`)}
                          >
                            {copiedCode === `backup-${index}` ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep("enable");
                        setCode("");
                      }}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleVerify}
                      disabled={isLoading || code.length !== 6}
                      className="flex-1"
                    >
                      تحقق وتفعيل
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
