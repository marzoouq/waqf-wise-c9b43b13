import { useState, useEffect } from "react";
import { productionLogger } from "@/lib/logger/production-logger";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare, Smartphone, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/ui/use-toast";
import { AuthService } from "@/services/auth.service";
import { useAuth } from "@/contexts/AuthContext";
import { usePushNotifications } from "@/hooks/notifications/usePushNotifications";

interface NotificationChannel {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  description: string;
  status: 'active' | 'pending' | 'disabled' | 'denied';
}

export function MultiChannelNotifications() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    isSupported: isPushSupported, 
    permission: pushPermission, 
    isSubscribed: isPushSubscribed,
    isLoading: isPushLoading,
    requestPermission,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush
  } = usePushNotifications();

  const getPushStatus = (): 'active' | 'pending' | 'disabled' | 'denied' => {
    if (!isPushSupported) return 'disabled';
    if (pushPermission === 'denied') return 'denied';
    if (isPushSubscribed) return 'active';
    return 'pending';
  };

  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'in_app',
      name: 'إشعارات داخل التطبيق',
      icon: <Bell className="h-5 w-5" />,
      enabled: true,
      description: 'إشعارات فورية داخل النظام',
      status: 'active'
    },
    {
      id: 'email',
      name: 'البريد الإلكتروني',
      icon: <Mail className="h-5 w-5" />,
      enabled: false,
      description: 'إرسال إشعارات عبر البريد الإلكتروني',
      status: 'pending'
    },
    {
      id: 'sms',
      name: 'الرسائل القصيرة (SMS)',
      icon: <MessageSquare className="h-5 w-5" />,
      enabled: false,
      description: 'إرسال إشعارات عبر الرسائل القصيرة',
      status: 'pending'
    },
    {
      id: 'push',
      name: 'الإشعارات الفورية (Push)',
      icon: <Smartphone className="h-5 w-5" />,
      enabled: isPushSubscribed,
      description: !isPushSupported 
        ? 'المتصفح لا يدعم الإشعارات الفورية'
        : pushPermission === 'denied'
        ? 'تم رفض الإذن - قم بتفعيله من إعدادات المتصفح'
        : 'إشعارات فورية على هذا الجهاز',
      status: getPushStatus()
    }
  ]);

  // تحديث حالة Push عند تغيرها
  useEffect(() => {
    setChannels(prev => 
      prev.map(c => 
        c.id === 'push' 
          ? { 
              ...c, 
              enabled: isPushSubscribed,
              status: getPushStatus(),
              description: !isPushSupported 
                ? 'المتصفح لا يدعم الإشعارات الفورية'
                : pushPermission === 'denied'
                ? 'تم رفض الإذن - قم بتفعيله من إعدادات المتصفح'
                : 'إشعارات فورية على هذا الجهاز'
            }
          : c
      )
    );
  }, [isPushSupported, pushPermission, isPushSubscribed]);

  const toggleChannel = async (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    
    if (!channel) return;

    // معالجة خاصة لـ Push Notifications
    if (channelId === 'push') {
      if (!isPushSupported) {
        toast({
          title: "غير مدعوم",
          description: "المتصفح الحالي لا يدعم الإشعارات الفورية",
          variant: "destructive"
        });
        return;
      }

      if (pushPermission === 'denied') {
        toast({
          title: "الإذن مرفوض",
          description: "يرجى السماح بالإشعارات من إعدادات المتصفح ثم تحديث الصفحة",
          variant: "destructive"
        });
        return;
      }

      try {
        if (isPushSubscribed) {
          await unsubscribePush();
        } else {
          if (pushPermission !== 'granted') {
            await requestPermission();
          }
          await subscribePush();
        }
      } catch (error) {
        productionLogger.error('Error toggling push notifications:', error);
      }
      return;
    }

    // القنوات الأخرى (email, sms) - قريباً
    if (!channel.enabled && channel.status === 'pending') {
      toast({
        title: "قريباً",
        description: `قناة ${channel.name} ستكون متاحة قريباً`,
        variant: "default"
      });
      return;
    }

    setChannels(prev => 
      prev.map(c => 
        c.id === channelId 
          ? { ...c, enabled: !c.enabled }
          : c
      )
    );

    // حفظ الإعدادات
    try {
      if (user?.id) {
        const settingKey = `enable_${channelId === 'in_app' ? 'in_app' : channelId}`;
        await AuthService.updateNotificationSettings(user.id, {
          [settingKey]: !channel.enabled,
        });

        toast({
          title: "تم الحفظ",
          description: `تم ${!channel.enabled ? 'تفعيل' : 'إيقاف'} ${channel.name}`,
        });
      }
    } catch (error) {
      productionLogger.error('Error updating notification preferences:', error);
      toast({
        title: "خطأ",
        description: "فشل حفظ الإعدادات",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (channel: NotificationChannel) => {
    // حالة خاصة لـ Push أثناء التحميل
    if (channel.id === 'push' && isPushLoading) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          جاري التحميل...
        </Badge>
      );
    }

    switch (channel.status) {
      case 'active':
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="h-3 w-3 ms-1" />
            مفعّل
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="h-3 w-3 ms-1" />
            مرفوض
          </Badge>
        );
      case 'disabled':
        return (
          <Badge variant="secondary">
            غير مدعوم
          </Badge>
        );
      case 'pending':
        // التفريق بين Push (جاهز للتفعيل) والقنوات الأخرى (قريباً)
        if (channel.id === 'push') {
          return (
            <Badge variant="outline" className="text-primary border-primary/30">
              <Bell className="h-3 w-3 ms-1" />
              جاهز للتفعيل
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <AlertCircle className="h-3 w-3 ms-1" />
            قريباً
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            معطّل
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>قنوات الإشعارات</CardTitle>
          <CardDescription>
            إدارة قنوات إرسال الإشعارات المختلفة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {channels.map((channel) => (
            <div 
              key={channel.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {channel.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{channel.name}</h4>
                    {getStatusBadge(channel)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {channel.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={channel.enabled}
                  onCheckedChange={() => toggleChannel(channel.id)}
                  disabled={
                    channel.status === 'disabled' || 
                    (channel.id === 'push' && (isPushLoading || pushPermission === 'denied'))
                  }
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            ملاحظة
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • <strong>الإشعارات الداخلية</strong> مفعّلة بشكل كامل
          </p>
          <p>
            • <strong>الإشعارات الفورية (Push)</strong> متاحة للتفعيل على هذا الجهاز
          </p>
          <p>
            • <strong>البريد الإلكتروني و SMS</strong> ستكون متاحة قريباً
          </p>
          {pushPermission === 'denied' && (
            <p className="text-destructive">
              • <strong>تنبيه:</strong> تم رفض إذن الإشعارات. لتفعيلها، اذهب لإعدادات المتصفح → الإشعارات → السماح لهذا الموقع
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}