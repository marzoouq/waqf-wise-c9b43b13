/**
 * ResetPasswordDialog Component
 * حوار إعادة تعيين كلمة المرور
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import type { UserProfile } from "@/hooks/useUsersManagement";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  password: string;
  onPasswordChange: (value: string) => void;
  onReset: () => void;
  isResetting: boolean;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  password,
  onPasswordChange,
  onReset,
  isResetting,
}: ResetPasswordDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
    onPasswordChange("");
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="تعيين كلمة مرور مؤقتة"
      description={`تعيين كلمة مرور جديدة للمستخدم: ${user?.full_name}`}
      size="sm"
    >
      <div className="space-y-4">
        <Alert className="border-warning/50 bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertTitle>تنبيه أمني</AlertTitle>
          <AlertDescription>
            سيتم إرسال إشعار للمستخدم بتغيير كلمة المرور. يُنصح بإخباره شخصياً.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="newPassword">كلمة المرور الجديدة *</Label>
          <Input
            id="newPassword"
            type="text"
            placeholder="أدخل كلمة المرور المؤقتة (8 أحرف على الأقل)"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="text-left"
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">
            مثال: User@123456
          </p>
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-4">
        <Button variant="outline" onClick={handleClose}>
          إلغاء
        </Button>
        <Button
          onClick={onReset}
          disabled={password.length < 8 || isResetting || !user?.user_id}
        >
          {isResetting ? "جاري التحديث..." : "تعيين كلمة المرور"}
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
