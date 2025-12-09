import { useState } from "react";
import { productionLogger } from "@/lib/logger/production-logger";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessageSquare, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NotificationChannel {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  description: string;
  status: 'active' | 'pending' | 'disabled';
}

export function MultiChannelNotifications() {
  const { toast } = useToast();
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
      enabled: false,
      description: 'إشعارات فورية على الأجهزة المحمولة',
      status: 'pending'
    }
  ]);

  const toggleChannel = async (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    
    if (!channel) return;

    if (!channel.enabled && channel.status === 'pending') {
      toast({
        title: "قريباً",
        description: `قناة ${channel.name} ستكون متاحة قريباً عبر Lovable Cloud`,
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('notification_settings')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        const updateData = {
          [`enable_${channelId === 'in_app' ? 'in_app' : channelId}`]: !channel.enabled,
        };

        let error;
        if (existing) {
          const result = await supabase
            .from('notification_settings')
            .update(updateData)
            .eq('user_id', user.id);
          error = result.error;
        } else {
          const result = await supabase
            .from('notification_settings')
            .insert({
              user_id: user.id,
              ...updateData
            });
          error = result.error;
        }

        if (error) throw error;

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="h-3 w-3 ml-1" />
            مفعّل
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <AlertCircle className="h-3 w-3 ml-1" />
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
                    {getStatusBadge(channel.status)}
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
                  disabled={channel.status === 'disabled'}
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
            • <strong>البريد الإلكتروني، SMS، والإشعارات الفورية</strong> ستكون متاحة قريباً عبر Lovable Cloud
          </p>
          <p>
            • يمكن تفعيلها بسهولة عند الحاجة دون الحاجة لتعديل الكود
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
