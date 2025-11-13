import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Mail, MessageSquare, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NotificationsPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    requestNotifications: boolean;
    paymentNotifications: boolean;
    reportNotifications: boolean;
  };
}

export function NotificationsPreviewDialog({ 
  open, 
  onOpenChange, 
  settings 
}: NotificationsPreviewDialogProps) {
  const previewNotifications = [
    {
      id: 1,
      type: "request",
      icon: AlertCircle,
      title: "طلب جديد من مستفيد",
      message: "تم استلام طلب فزعة طارئة من أحمد محمد",
      time: "منذ 5 دقائق",
      enabled: settings.requestNotifications,
      color: "text-orange-500"
    },
    {
      id: 2,
      type: "payment",
      icon: CheckCircle,
      title: "تم اعتماد دفعة",
      message: "تم اعتماد دفعة بمبلغ 50,000 ريال",
      time: "منذ 10 دقائق",
      enabled: settings.paymentNotifications,
      color: "text-green-500"
    },
    {
      id: 3,
      type: "report",
      icon: Info,
      title: "تقرير شهري جاهز",
      message: "التقرير المالي لشهر نوفمبر متاح الآن",
      time: "منذ ساعة",
      enabled: settings.reportNotifications,
      color: "text-blue-500"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            معاينة الإشعارات
          </DialogTitle>
          <DialogDescription>
            معاينة كيف ستظهر الإشعارات بناءً على الإعدادات الحالية
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Channels Status */}
          <Card className="p-4 bg-muted/50">
            <h3 className="font-semibold mb-3">القنوات المفعلة:</h3>
            <div className="flex flex-wrap gap-2">
              {settings.emailNotifications && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  <Mail className="h-4 w-4" />
                  البريد الإلكتروني
                </div>
              )}
              {settings.smsNotifications && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm">
                  <MessageSquare className="h-4 w-4" />
                  الرسائل النصية
                </div>
              )}
              {settings.pushNotifications && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">
                  <Bell className="h-4 w-4" />
                  الإشعارات الفورية
                </div>
              )}
            </div>
          </Card>

          {/* Notifications Preview */}
          <div className="space-y-3">
            <h3 className="font-semibold">أمثلة على الإشعارات:</h3>
            {previewNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <Card
                  key={notification.id}
                  className={`p-4 transition-all ${
                    notification.enabled
                      ? "bg-card border-border"
                      : "bg-muted/30 opacity-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${notification.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{notification.title}</h4>
                        {!notification.enabled && (
                          <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
                            معطل
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Info Message */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex gap-2">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">ملاحظة:</p>
                الإشعارات المعطلة لن تظهر للمستخدمين. يمكنك تفعيل أو تعطيل أنواع محددة من الإشعارات حسب الحاجة.
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
