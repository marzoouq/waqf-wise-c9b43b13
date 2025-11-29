import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Globe, Mail, Phone, MapPin, FileText, HelpCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LandingSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  is_active: boolean;
}

export default function LandingPageSettings() {
  const queryClient = useQueryClient();
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['landing-page-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_settings')
        .select('*')
        .order('setting_key');
      
      if (error) throw error;
      return data as LandingSetting[];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('landing_page_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page-settings'] });
      toast.success('تم حفظ الإعدادات بنجاح');
    },
    onError: (error) => {
      toast.error('فشل حفظ الإعدادات');
      console.error(error);
    }
  });

  const handleChange = (key: string, value: string) => {
    setEditedSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (key: string) => {
    const value = editedSettings[key];
    if (value !== undefined) {
      // Wrap string values in quotes for JSONB
      const jsonValue = JSON.stringify(value);
      updateMutation.mutate({ key, value: jsonValue });
    }
  };

  const getValue = (key: string): string => {
    if (editedSettings[key] !== undefined) {
      return editedSettings[key];
    }
    const setting = settings?.find(s => s.setting_key === key);
    if (!setting) return '';
    try {
      return JSON.parse(setting.setting_value as string);
    } catch {
      return setting.setting_value as string;
    }
  };

  const contactSettings = ['contact_email', 'contact_phone', 'contact_address'];
  const socialSettings = ['social_twitter', 'social_linkedin'];
  const textSettings = ['hero_title', 'hero_subtitle', 'footer_description'];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إعدادات الصفحة الترحيبية</h1>
          <p className="text-muted-foreground mt-1">تحكم بمحتوى وإعدادات الصفحة الرئيسية</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['landing-page-settings'] })}
        >
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      <Tabs defaultValue="contact" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contact">معلومات الاتصال</TabsTrigger>
          <TabsTrigger value="social">التواصل الاجتماعي</TabsTrigger>
          <TabsTrigger value="content">المحتوى</TabsTrigger>
          <TabsTrigger value="legal">الصفحات القانونية</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                معلومات الاتصال
              </CardTitle>
              <CardDescription>
                البريد الإلكتروني ورقم الهاتف والعنوان المعروض في الصفحة الترحيبية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <div className="flex gap-2">
                  <Input
                    value={getValue('contact_email')}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="info@example.com"
                    dir="ltr"
                  />
                  <Button 
                    onClick={() => handleSave('contact_email')}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <div className="flex gap-2">
                  <Input
                    value={getValue('contact_phone')}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    placeholder="+966 50 000 0000"
                    dir="ltr"
                  />
                  <Button 
                    onClick={() => handleSave('contact_phone')}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>العنوان</Label>
                <div className="flex gap-2">
                  <Input
                    value={getValue('contact_address')}
                    onChange={(e) => handleChange('contact_address', e.target.value)}
                    placeholder="الرياض، المملكة العربية السعودية"
                  />
                  <Button 
                    onClick={() => handleSave('contact_address')}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                روابط التواصل الاجتماعي
              </CardTitle>
              <CardDescription>
                روابط حسابات التواصل الاجتماعي المعروضة في الـ Footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>رابط تويتر / X</Label>
                <div className="flex gap-2">
                  <Input
                    value={getValue('social_twitter')}
                    onChange={(e) => handleChange('social_twitter', e.target.value)}
                    placeholder="https://twitter.com/..."
                    dir="ltr"
                  />
                  <Button 
                    onClick={() => handleSave('social_twitter')}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>رابط لينكدإن</Label>
                <div className="flex gap-2">
                  <Input
                    value={getValue('social_linkedin')}
                    onChange={(e) => handleChange('social_linkedin', e.target.value)}
                    placeholder="https://linkedin.com/..."
                    dir="ltr"
                  />
                  <Button 
                    onClick={() => handleSave('social_linkedin')}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                محتوى الصفحة
              </CardTitle>
              <CardDescription>
                النصوص الرئيسية المعروضة في الصفحة الترحيبية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>العنوان الرئيسي</Label>
                <div className="flex gap-2">
                  <Input
                    value={getValue('hero_title')}
                    onChange={(e) => handleChange('hero_title', e.target.value)}
                    placeholder="منصة إدارة الوقف الإلكترونية"
                  />
                  <Button 
                    onClick={() => handleSave('hero_title')}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>العنوان الفرعي</Label>
                <div className="flex gap-2">
                  <Input
                    value={getValue('hero_subtitle')}
                    onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                    placeholder="نظام متكامل لإدارة الأوقاف"
                  />
                  <Button 
                    onClick={() => handleSave('hero_subtitle')}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>وصف الـ Footer</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={getValue('footer_description')}
                    onChange={(e) => handleChange('footer_description', e.target.value)}
                    placeholder="وصف مختصر عن المنصة..."
                    rows={3}
                  />
                  <Button 
                    onClick={() => handleSave('footer_description')}
                    disabled={updateMutation.isPending}
                    className="self-start"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                الصفحات القانونية
              </CardTitle>
              <CardDescription>
                يمكنك تعديل محتوى الصفحات القانونية مباشرة من الكود أو إضافة محرر نصوص متقدم لاحقاً
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <a 
                  href="/privacy" 
                  target="_blank" 
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-medium mb-1">سياسة الخصوصية</h3>
                  <p className="text-sm text-muted-foreground">عرض الصفحة</p>
                </a>
                <a 
                  href="/terms" 
                  target="_blank" 
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-medium mb-1">شروط الاستخدام</h3>
                  <p className="text-sm text-muted-foreground">عرض الصفحة</p>
                </a>
                <a 
                  href="/security-policy" 
                  target="_blank" 
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-medium mb-1">سياسة الأمان</h3>
                  <p className="text-sm text-muted-foreground">عرض الصفحة</p>
                </a>
                <a 
                  href="/faq" 
                  target="_blank" 
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-medium mb-1">الأسئلة الشائعة</h3>
                  <p className="text-sm text-muted-foreground">عرض الصفحة</p>
                </a>
                <a 
                  href="/contact" 
                  target="_blank" 
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-medium mb-1">تواصل معنا</h3>
                  <p className="text-sm text-muted-foreground">عرض الصفحة</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
