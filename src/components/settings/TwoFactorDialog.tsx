import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Key, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { AuthService } from "@/services/auth.service";
import { useProfile } from "@/hooks/useProfile";
import { useTwoFactorAuth } from "@/hooks/settings/useTwoFactorAuth";
import { logger } from "@/lib/logger";

interface TwoFactorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TwoFactorDialog = ({ open, onOpenChange }: TwoFactorDialogProps) => {
  const { profile } = useProfile();
  const { twoFactorEnabled, invalidate2FAStatus } = useTwoFactorAuth(profile?.user_id);
  const [step, setStep] = useState<"enable" | "verify">("enable");
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSecret = () => {
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
      logger.error(error, { context: 'enable_2fa', severity: 'medium' });
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
      await AuthService.enable2FA(profile?.user_id || "", secret, backupCodes);

      await invalidate2FAStatus();
      toast.success("تم تفعيل المصادقة الثنائية بنجاح");
      onOpenChange(false);
      setStep("enable");
      setCode("");
    } catch (error) {
      toast.error("حدث خطأ أثناء التحقق من الرمز");
      logger.error(error, { context: 'verify_2fa_code', severity: 'medium' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      await AuthService.disable2FA(profile?.user_id || "");

      await invalidate2FAStatus();
      toast.success("تم إلغاء تفعيل المصادقة الثنائية");
      onOpenChange(false);
    } catch (error) {
      toast.error("حدث خطأ أثناء إلغاء التفعيل");
      logger.error(error, { context: 'disable_2fa', severity: 'medium' });
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
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={twoFactorEnabled ? "إدارة المصادقة الثنائية" : "تفعيل المصادقة الثنائية"}
      description={twoFactorEnabled
        ? "يمكنك تعطيل المصادقة الثنائية من هنا"
        : "أضف طبقة أمان إضافية لحسابك"}
      size="lg"
    >
      {twoFactorEnabled ? (
        <div className="space-y-4">
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-success">
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
                <Key className="h-4 w-4 ms-2" />
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
                    <code className="flex-1 bg-background p-3 rounded border text-sm font-mono break-all">
                      {secret}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(secret, "secret")}
                    >
                      {copiedCode === "secret" ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    انسخ هذا المفتاح وأضفه إلى تطبيق المصادقة الخاص بك
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>أدخل الرمز للتحقق:</Label>
                  <Input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <Label className="mb-2 block">رموز النسخ الاحتياطي:</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    احفظ هذه الرموز في مكان آمن. يمكنك استخدامها إذا فقدت الوصول لتطبيق المصادقة.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((backupCode, codeIndex) => (
                      <div key={`backup-${backupCode}`} className="flex items-center gap-2">
                        <code className="flex-1 bg-background p-2 rounded border text-xs font-mono">
                          {backupCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(backupCode, `backup-${codeIndex}`)}
                        >
                          {copiedCode === `backup-${codeIndex}` ? (
                            <Check className="h-3 w-3 text-success" />
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
                    onClick={() => setStep("enable")}
                    className="flex-1"
                  >
                    رجوع
                  </Button>
                  <Button
                    onClick={handleVerify}
                    disabled={isLoading || code.length !== 6}
                    className="flex-1"
                  >
                    تحقق وفعّل
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </ResponsiveDialog>
  );
};
