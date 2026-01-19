/**
 * BroadcastNotificationDialog - نافذة إرسال إشعار جماعي
 * 
 * تتيح للمسؤولين إرسال إشعارات لمجموعات محددة من المستخدمين
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NotificationService } from '@/services/notification.service';
import { toast } from 'sonner';
import { Send, Users, Loader2 } from 'lucide-react';

interface BroadcastNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  senderName?: string;
}

type TargetType = 'all' | 'beneficiaries' | 'staff' | 'role';
type NotificationType = 'info' | 'success' | 'warning' | 'error';
type Priority = 'low' | 'medium' | 'high';

const ROLES = [
  { value: 'admin', label: 'المسؤول' },
  { value: 'nazer', label: 'الناظر' },
  { value: 'accountant', label: 'المحاسب' },
  { value: 'cashier', label: 'أمين الصندوق' },
  { value: 'archivist', label: 'أمين الأرشيف' },
  { value: 'beneficiary', label: 'المستفيد' },
];

export function BroadcastNotificationDialog({
  open,
  onOpenChange,
  senderName,
}: BroadcastNotificationDialogProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [selectedRole, setSelectedRole] = useState('');
  const [notificationType, setNotificationType] = useState<NotificationType>('info');
  const [priority, setPriority] = useState<Priority>('medium');
  const [actionUrl, setActionUrl] = useState('');
  const [recipientCount, setRecipientCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCountLoading, setIsCountLoading] = useState(false);

  // جلب عدد المستلمين عند تغيير الهدف
  useEffect(() => {
    const fetchCount = async () => {
      setIsCountLoading(true);
      const count = await NotificationService.getTargetUserCount(
        targetType,
        targetType === 'role' ? selectedRole : undefined
      );
      setRecipientCount(count);
      setIsCountLoading(false);
    };

    if (open) {
      fetchCount();
    }
  }, [open, targetType, selectedRole]);

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('يرجى ملء العنوان والرسالة');
      return;
    }

    if (targetType === 'role' && !selectedRole) {
      toast.error('يرجى اختيار الدور');
      return;
    }

    if (recipientCount === 0) {
      toast.error('لا يوجد مستخدمين في الفئة المحددة');
      return;
    }

    setIsLoading(true);

    try {
      const result = await NotificationService.sendBroadcast({
        title: title.trim(),
        message: message.trim(),
        targetType,
        targetValue: targetType === 'role' ? selectedRole : undefined,
        type: notificationType,
        priority,
        actionUrl: actionUrl.trim() || undefined,
        senderName,
      });

      if (result.success) {
        toast.success(`تم إرسال الإشعار إلى ${result.recipientCount} مستخدم`);
        handleClose();
      } else {
        toast.error(result.error || 'فشل في إرسال الإشعار');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال الإشعار');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setMessage('');
    setTargetType('all');
    setSelectedRole('');
    setNotificationType('info');
    setPriority('medium');
    setActionUrl('');
    onOpenChange(false);
  };

  const getTargetLabel = () => {
    switch (targetType) {
      case 'all':
        return 'جميع المستخدمين';
      case 'beneficiaries':
        return 'المستفيدين';
      case 'staff':
        return 'الموظفين';
      case 'role':
        return ROLES.find(r => r.value === selectedRole)?.label || 'دور محدد';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            إرسال إشعار جماعي
          </DialogTitle>
          <DialogDescription>
            أرسل إشعاراً لمجموعة من المستخدمين في النظام
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* العنوان */}
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الإشعار *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان الإشعار"
              maxLength={100}
            />
          </div>

          {/* الرسالة */}
          <div className="space-y-2">
            <Label htmlFor="message">نص الرسالة *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="أدخل نص الإشعار"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* المستهدفون */}
          <div className="space-y-3">
            <Label>المستهدفون</Label>
            <RadioGroup
              value={targetType}
              onValueChange={(value) => setTargetType(value as TargetType)}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer">جميع المستخدمين</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="beneficiaries" id="beneficiaries" />
                <Label htmlFor="beneficiaries" className="cursor-pointer">المستفيدين</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="staff" id="staff" />
                <Label htmlFor="staff" className="cursor-pointer">الموظفين</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="role" id="role" />
                <Label htmlFor="role" className="cursor-pointer">دور محدد</Label>
              </div>
            </RadioGroup>

            {/* اختيار الدور */}
            {targetType === 'role' && (
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* نوع الإشعار والأولوية */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع الإشعار</Label>
              <Select value={notificationType} onValueChange={(v) => setNotificationType(v as NotificationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">معلومات</SelectItem>
                  <SelectItem value="success">نجاح</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                  <SelectItem value="error">خطأ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الأولوية</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* رابط الإجراء */}
          <div className="space-y-2">
            <Label htmlFor="actionUrl">رابط الإجراء (اختياري)</Label>
            <Input
              id="actionUrl"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="/path/to/page"
              dir="ltr"
            />
          </div>

          {/* عدد المستلمين */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">عدد المستلمين:</span>
            </div>
            {isCountLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="font-bold text-primary">{recipientCount}</span>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !title.trim() || !message.trim() || recipientCount === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ms-2" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 ms-2" />
                إرسال للـ {recipientCount} مستخدم
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
