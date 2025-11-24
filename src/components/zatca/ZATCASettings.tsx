import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Shield, Key, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ZATCASettings() {
  const [settings, setSettings] = useState({
    enabled: false,
    organizationId: "",
    vatNumber: "",
    apiKey: "",
    testMode: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: حفظ الإعدادات في قاعدة البيانات
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("تم حفظ الإعدادات", {
        description: "تم حفظ إعدادات هيئة الزكاة والضريبة بنجاح",
      });
    } catch (error) {
      toast.error("خطأ في الحفظ", {
        description: "تعذر حفظ الإعدادات. الرجاء المحاولة مرة أخرى.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    toast.info("جاري الاختبار...", {
      description: "يتم التحقق من الاتصال بخدمة الهيئة",
    });

    // محاكاة اختبار الاتصال
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (settings.apiKey && settings.organizationId) {
      toast.success("نجح الاتصال", {
        description: "تم التحقق من الاتصال بنجاح",
        icon: <CheckCircle className="h-5 w-5 text-success" />,
      });
    } else {
      toast.error("فشل الاتصال", {
        description: "الرجاء التحقق من البيانات المدخلة",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <div>
              <CardTitle>إعدادات هيئة الزكاة والضريبة (ZATCA)</CardTitle>
              <CardDescription>
                قم بتكوين الاتصال مع منصة الفوترة الإلكترونية
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable ZATCA Integration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <Label className="text-base">تفعيل التكامل مع الهيئة</Label>
                <p className="text-sm text-muted-foreground">
                  تفعيل إرسال الفواتير تلقائياً لهيئة الزكاة والضريبة
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enabled: checked })
              }
            />
          </div>

          {/* Configuration Fields */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="orgId">رقم المنشأة</Label>
              <Input
                id="orgId"
                placeholder="أدخل رقم المنشأة"
                value={settings.organizationId}
                onChange={(e) =>
                  setSettings({ ...settings, organizationId: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                رقم التعريف الخاص بالمنشأة لدى الهيئة
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vatNumber">الرقم الضريبي</Label>
              <Input
                id="vatNumber"
                placeholder="أدخل الرقم الضريبي"
                value={settings.vatNumber}
                onChange={(e) =>
                  setSettings({ ...settings, vatNumber: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                رقم التسجيل الضريبي (15 رقم)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                مفتاح API
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="أدخل مفتاح API"
                value={settings.apiKey}
                onChange={(e) =>
                  setSettings({ ...settings, apiKey: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                مفتاح الوصول للربط مع منصة الفوترة الإلكترونية
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div>
                <Label className="text-base">الوضع التجريبي</Label>
                <p className="text-sm text-muted-foreground">
                  استخدام بيئة الاختبار للتطوير والتجربة
                </p>
              </div>
              <Switch
                checked={settings.testMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, testMode: checked })
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!settings.organizationId || !settings.apiKey}
            >
              اختبار الاتصال
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-info">
        <CardHeader>
          <CardTitle className="text-base">معلومات مهمة</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>• يجب التسجيل في منصة الفوترة الإلكترونية قبل استخدام هذه الميزة</p>
          <p>• الوضع التجريبي يستخدم بيئة الاختبار ولا يؤثر على البيانات الحقيقية</p>
          <p>• يتم إرسال الفواتير تلقائياً عند إنشائها إذا كان التكامل مفعلاً</p>
          <p>• يمكن إرسال الفواتير يدوياً من صفحة تفاصيل الفاتورة</p>
        </CardContent>
      </Card>
    </div>
  );
}
