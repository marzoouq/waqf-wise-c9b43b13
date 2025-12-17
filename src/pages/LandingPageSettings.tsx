import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Globe, Mail, RefreshCw, FileText, HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { useLandingPageSettings } from "@/hooks/settings/useLandingPageSettings";

export default function LandingPageSettings() {
  const {
    isLoading,
    error,
    handleChange,
    handleSave,
    getValue,
    refreshSettings,
    isSaving,
  } = useLandingPageSettings();

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

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل إعدادات الصفحة" onRetry={refreshSettings} />;
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
          onClick={refreshSettings}
        >
          <RefreshCw className="h-4 w-4 ms-2" />
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                <Link 
                  to="/privacy" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors block"
                >
                  <h3 className="font-medium mb-1">سياسة الخصوصية</h3>
                  <p className="text-sm text-muted-foreground">عرض الصفحة</p>
                </Link>
                <Link 
                  to="/terms" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors block"
                >
                  <h3 className="font-medium mb-1">شروط الاستخدام</h3>
                  <p className="text-sm text-muted-foreground">عرض الصفحة</p>
                </Link>
                <Link 
                  to="/security-policy" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors block"
                >
                  <h3 className="font-medium mb-1">سياسة الأمان</h3>
                  <p className="text-sm text-muted-foreground">عرض الصفحة</p>
                </Link>
                <Link 
                  to="/faq" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors block"
                >
                  <h3 className="font-medium mb-1">الأسئلة الشائعة</h3>
                  <p className="text-sm text-muted-foreground">عرض الصفحة</p>
                </Link>
                <Link 
                  to="/contact" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors block"
                >
                  <h3 className="font-medium mb-1">تواصل معنا</h3>
                  <p className="text-sm text-muted-foreground">عرض الصفحة</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
