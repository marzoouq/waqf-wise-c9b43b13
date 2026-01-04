/**
 * مكون إعدادات الختم والتوقيع والشعار للوقف
 * @version 2.0.0 - إضافة شعار الوقف وخيارات الإظهار
 */

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Stamp, FileSignature, Upload, Loader2, Save, User, Image, Eye, EyeOff } from "lucide-react";
import { useWaqfBranding } from "@/hooks/nazer/useWaqfBranding";

export const WaqfBrandingSettings = () => {
  const { 
    branding, 
    isLoading, 
    uploadStamp, 
    uploadSignature, 
    uploadLogo,
    updateNazerName, 
    toggleShowLogo,
    toggleShowStamp,
    isUpdating 
  } = useWaqfBranding();
  const [nazerName, setNazerName] = useState("");
  const stampInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadStamp(file);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadSignature(file);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadLogo(file);
    }
  };

  const handleSaveNazerName = async () => {
    if (nazerName.trim()) {
      await updateNazerName(nazerName.trim());
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stamp className="h-5 w-5 text-primary" />
          إعدادات الهوية البصرية
        </CardTitle>
        <CardDescription>
          رفع شعار الوقف والختم الرسمي والتوقيع لاستخدامها في التقارير والمستندات
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* اسم الناظر */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User className="h-4 w-4" />
            اسم الناظر
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder={branding?.nazer_name || "ناظر الوقف"}
              value={nazerName}
              onChange={(e) => setNazerName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSaveNazerName}
              disabled={isUpdating || !nazerName.trim()}
              size="sm"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            الاسم الحالي: {branding?.nazer_name || "ناظر الوقف"}
          </p>
        </div>

        {/* شعار الوقف */}
        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              شعار الوقف
            </Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="show-logo" className="text-xs text-muted-foreground">
                إظهار في PDF
              </Label>
              <Switch
                id="show-logo"
                checked={branding?.show_logo_in_pdf ?? true}
                onCheckedChange={toggleShowLogo}
                disabled={isUpdating}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-background">
              {branding?.waqf_logo_url ? (
                <img
                  src={branding.waqf_logo_url}
                  alt="شعار الوقف"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <Image className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUpdating}
                className="gap-2"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                رفع شعار الوقف
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG بخلفية شفافة - يظهر في أعلى جميع التقارير
              </p>
            </div>
          </div>
        </div>

        {/* الختم الرسمي */}
        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Stamp className="h-4 w-4" />
              الختم الرسمي
            </Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="show-stamp" className="text-xs text-muted-foreground">
                إظهار في PDF
              </Label>
              <Switch
                id="show-stamp"
                checked={branding?.show_stamp_in_pdf ?? true}
                onCheckedChange={toggleShowStamp}
                disabled={isUpdating}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-background">
              {branding?.stamp_image_url ? (
                <img
                  src={branding.stamp_image_url}
                  alt="الختم الرسمي"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <Stamp className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="file"
                ref={stampInputRef}
                onChange={handleStampUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => stampInputRef.current?.click()}
                disabled={isUpdating}
                className="gap-2"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                رفع صورة الختم
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG أو JPG بخلفية شفافة (مستحسن)
              </p>
            </div>
          </div>
        </div>

        {/* التوقيع */}
        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
          <Label className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            التوقيع
          </Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-background">
              {branding?.signature_image_url ? (
                <img
                  src={branding.signature_image_url}
                  alt="التوقيع"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <FileSignature className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="file"
                ref={signatureInputRef}
                onChange={handleSignatureUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => signatureInputRef.current?.click()}
                disabled={isUpdating}
                className="gap-2"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                رفع صورة التوقيع
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG بخلفية شفافة للحصول على أفضل نتيجة
              </p>
            </div>
          </div>
        </div>

        {/* معلومات آخر تحديث */}
        {branding?.updated_at && (
          <p className="text-xs text-muted-foreground pt-4 border-t">
            آخر تحديث: {new Date(branding.updated_at).toLocaleDateString("ar-SA")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
