import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";

interface NotificationPreferencesProps {
  beneficiaryId: string;
  currentPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export function NotificationPreferences({
  beneficiaryId,
  currentPreferences = { email: true, sms: false, push: false },
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState(currentPreferences);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("beneficiaries")
        .update({
          notification_preferences: preferences,
        })
        .eq("id", beneficiaryId);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات الإشعارات بنجاح",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'فشل حفظ التفضيلات';
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          إعدادات الإشعارات
        </CardTitle>
        <CardDescription>
          اختر كيف تريد استلام الإشعارات المهمة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="email-notifications" className="text-base">
                البريد الإلكتروني
              </Label>
              <p className="text-sm text-muted-foreground">
                استقبل الإشعارات عبر البريد الإلكتروني
              </p>
            </div>
          </div>
          <Switch
            id="email-notifications"
            checked={preferences.email}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, email: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="sms-notifications" className="text-base">
                الرسائل القصيرة (SMS)
              </Label>
              <p className="text-sm text-muted-foreground">
                استقبل الإشعارات عبر الرسائل النصية
              </p>
            </div>
          </div>
          <Switch
            id="sms-notifications"
            checked={preferences.sms}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, sms: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="push-notifications" className="text-base">
                الإشعارات الفورية (Push)
              </Label>
              <p className="text-sm text-muted-foreground">
                استقبل إشعارات فورية على جهازك
              </p>
            </div>
          </div>
          <Switch
            id="push-notifications"
            checked={preferences.push}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, push: checked })
            }
          />
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
