import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react';
import { Beneficiary } from '@/types/beneficiary';
import { useIdentityVerification } from '@/hooks/beneficiary/useIdentityVerification';

interface IdentityVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiary: Beneficiary | null;
}

/**
 * محاور التحقق من الهوية - المرحلة 2
 * التحقق من بيانات المستفيد وتوثيق الهوية
 */
export function IdentityVerificationDialog({
  open,
  onOpenChange,
  beneficiary,
}: IdentityVerificationDialogProps) {
  const {
    formData,
    updateFormData,
    resetForm,
    verify,
    isVerifying,
  } = useIdentityVerification(beneficiary);

  const handleSubmit = () => {
    verify(undefined, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            التحقق من هوية المستفيد
          </DialogTitle>
          <DialogDescription>
            التحقق من بيانات ومستندات المستفيد: {beneficiary?.full_name}
          </DialogDescription>
        </DialogHeader>

        {beneficiary && (
          <div className="space-y-6">
            {/* معلومات المستفيد */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">رقم الهوية:</span>
                  <p className="text-muted-foreground">{beneficiary.national_id}</p>
                </div>
                <div>
                  <span className="font-medium">رقم الهاتف:</span>
                  <p className="text-muted-foreground" dir="ltr">{beneficiary.phone}</p>
                </div>
                <div>
                  <span className="font-medium">الحالة الحالية:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(beneficiary.verification_status || 'pending')}
                    <Badge variant="outline">
                      {beneficiary.verification_status || 'غير موثق'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="font-medium">آخر تحقق:</span>
                  <p className="text-muted-foreground">
                    {beneficiary.last_verification_date
                      ? new Date(beneficiary.last_verification_date).toLocaleDateString('ar-SA')
                      : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* نموذج التحقق */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="verification_type">نوع التحقق</Label>
                  <Select
                    value={formData.verification_type}
                    onValueChange={(value) =>
                      updateFormData({ verification_type: value })
                    }
                  >
                    <SelectTrigger id="verification_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="identity_card">بطاقة الهوية</SelectItem>
                      <SelectItem value="passport">جواز السفر</SelectItem>
                      <SelectItem value="residence_permit">إقامة</SelectItem>
                      <SelectItem value="driving_license">رخصة قيادة</SelectItem>
                      <SelectItem value="family_record">سجل عائلي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verification_method">طريقة التحقق</Label>
                  <Select
                    value={formData.verification_method}
                    onValueChange={(value) =>
                      updateFormData({ verification_method: value })
                    }
                  >
                    <SelectTrigger id="verification_method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">يدوي</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="document_scan">مسح المستند</SelectItem>
                      <SelectItem value="biometric">البصمة الحيوية</SelectItem>
                      <SelectItem value="third_party">جهة خارجية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification_status">حالة التحقق</Label>
                <Select
                  value={formData.verification_status}
                  onValueChange={(value) =>
                    updateFormData({ verification_status: value })
                  }
                >
                  <SelectTrigger id="verification_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد المراجعة</SelectItem>
                    <SelectItem value="verified">موثّق</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                    <SelectItem value="expired">منتهي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات التحقق</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    updateFormData({ notes: e.target.value })
                  }
                  placeholder="أدخل أي ملاحظات حول عملية التحقق..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isVerifying}>
            {isVerifying ? 'جاري التحقق...' : 'تأكيد التحقق'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
