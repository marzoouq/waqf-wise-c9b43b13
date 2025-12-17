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
import { Loader2, CheckCircle2, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useResetPassword } from '@/hooks/auth/useResetPassword';

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
  const {
    isLoading,
    newPassword,
    setNewPassword,
    showPassword,
    setShowPassword,
    isSuccess,
    generateRandomPassword,
    handleResetPassword,
    copyToClipboard,
    reset,
  } = useResetPassword(beneficiary, onSuccess);

  const handleClose = () => {
    reset();
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
                  onClick={generateRandomPassword}
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
                    <Loader2 className="ms-2 h-4 w-4 animate-spin" />
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
