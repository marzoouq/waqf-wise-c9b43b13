import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { generateSecurePassword } from '@/lib/beneficiaryAuth';
import { productionLogger } from '@/lib/logger/production-logger';

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiary: {
    id: string;
    full_name: string;
    national_id: string;
    user_id?: string | null;
  };
  onSuccess?: () => void;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  beneficiary,
  onSuccess,
}: ResetPasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const generateRandomPassword = () => {
    // استخدام نفس دالة التوليد الآمنة
    setNewPassword(generateSecurePassword());
  };

  const useDefaultPassword = () => {
    setNewPassword(generateSecurePassword());
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (!beneficiary.user_id) {
      toast.error('المستفيد لا يملك حساب مفعل');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        'admin-manage-beneficiary-password',
        {
          body: {
            action: 'reset-password',
            beneficiaryId: beneficiary.id,
            newPassword: newPassword,
          },
        }
      );

      if (error) {
        productionLogger.warn('Error resetting password:', error);
        toast.error('فشل إعادة تعيين كلمة المرور', {
          description: error.message || 'حدث خطأ غير متوقع',
        });
        setIsLoading(false);
        return;
      }

      productionLogger.debug('Password reset successful', data);
      toast.success('تم إعادة تعيين كلمة المرور بنجاح');
      setIsSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      productionLogger.warn('Error:', error);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('تم النسخ إلى الحافظة');
    } catch (error) {
      toast.error('فشل النسخ');
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setShowPassword(false);
    setIsSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
          <DialogDescription>
            إعادة تعيين كلمة مرور المستفيد: <strong>{beneficiary.full_name}</strong>
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <div className="space-y-4 py-4">
            <Alert>
              <AlertDescription className="text-sm">
                سيتم إعادة تعيين كلمة المرور مباشرة دون إرسال بريد إلكتروني.
                قم بإعطاء كلمة المرور الجديدة للمستفيد.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                    disabled={isLoading}
                    dir="ltr"
                    className="pr-10"
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
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={generateRandomPassword}
                  disabled={isLoading}
                  title="توليد كلمة مرور عشوائية"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                أو{' '}
                <button
                  type="button"
                  onClick={useDefaultPassword}
                  disabled={isLoading}
                  className="text-primary hover:underline"
                >
                  توليد كلمة مرور قوية تلقائياً
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Alert className="bg-success-light border-success">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <AlertDescription className="text-success-foreground">
                تم إعادة تعيين كلمة المرور بنجاح!
              </AlertDescription>
            </Alert>

            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm">معلومات تسجيل الدخول:</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">رقم الهوية:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                      {beneficiary.national_id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(beneficiary.national_id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">كلمة المرور:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-background px-2 py-1 rounded" dir="ltr">
                      {newPassword}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(newPassword)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <Alert className="mt-3">
                <AlertDescription className="text-xs">
                  ⚠️ قم بحفظ هذه المعلومات وإعطائها للمستفيد. لن تتمكن من رؤية كلمة المرور مرة أخرى.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        <DialogFooter>
          {!isSuccess ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={handleResetPassword}
                disabled={isLoading || !newPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التعيين...
                  </>
                ) : (
                  'إعادة تعيين كلمة المرور'
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>إغلاق</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}