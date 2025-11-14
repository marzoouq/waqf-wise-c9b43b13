import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTwoFactor } from '@/hooks/useTwoFactor';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Shield, Smartphone, Bell, Lock, Copy, CheckCircle2, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedSecurity() {
  const { twoFactorStatus, isEnabled, enableTwoFactor, verifyAndEnable, disableTwoFactor, isEnabling, isVerifying } = useTwoFactor();
  const { isSupported, permission, requestPermission, subscribe, unsubscribe, isRequesting, isSubscribing } = usePushNotifications();
  
  const [twoFactorSetup, setTwoFactorSetup] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const handleEnable2FA = async () => {
    try {
      const setup = await enableTwoFactor();
      setTwoFactorSetup(setup);
    } catch (error) {
      console.error('2FA Error:', error);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      toast.error('الرجاء إدخال رمز التحقق');
      return;
    }
    
    try {
      await verifyAndEnable(verificationCode);
      setTwoFactorSetup(null);
      setVerificationCode('');
    } catch (error) {
      console.error('Verification Error:', error);
    }
  };

  const handleDisable2FA = async () => {
    if (window.confirm('هل أنت متأكد من تعطيل المصادقة الثنائية؟')) {
      await disableTwoFactor();
    }
  };

  const handleEnableNotifications = async () => {
    try {
      await requestPermission();
      await subscribe();
    } catch (error) {
      console.error('Notification Error:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ إلى الحافظة');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">الأمان المتقدم</h1>
          <p className="text-muted-foreground mt-2">
            قم بتأمين حسابك باستخدام المصادقة الثنائية والإشعارات الفورية
          </p>
        </div>

        {/* المصادقة الثنائية */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>المصادقة الثنائية (2FA)</CardTitle>
                  <CardDescription>
                    أضف طبقة حماية إضافية لحسابك
                  </CardDescription>
                </div>
              </div>
              {isEnabled ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  مفعّل
                </Badge>
              ) : (
                <Badge variant="outline">غير مفعّل</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEnabled ? (
              <div className="space-y-4">
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    المصادقة الثنائية تحمي حسابك من الوصول غير المصرح به حتى لو تم اختراق كلمة المرور.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleEnable2FA} disabled={isEnabling}>
                  <Smartphone className="ml-2 h-4 w-4" />
                  تفعيل المصادقة الثنائية
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">المصادقة الثنائية مفعّلة</p>
                      <p className="text-sm text-muted-foreground">
                        تم التفعيل في {new Date(twoFactorStatus?.verified_at || '').toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setShowBackupCodes(true)}>
                    عرض الأكواد الاحتياطية
                  </Button>
                </div>
                <Button variant="destructive" onClick={handleDisable2FA}>
                  تعطيل المصادقة الثنائية
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* الإشعارات الفورية */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>الإشعارات الفورية</CardTitle>
                  <CardDescription>
                    استقبل تنبيهات فورية على أجهزتك
                  </CardDescription>
                </div>
              </div>
              {permission === 'granted' ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  مفعّل
                </Badge>
              ) : (
                <Badge variant="outline">غير مفعّل</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSupported ? (
              <Alert>
                <AlertDescription>
                  المتصفح الحالي لا يدعم الإشعارات الفورية
                </AlertDescription>
              </Alert>
            ) : permission !== 'granted' ? (
              <div className="space-y-4">
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertDescription>
                    احصل على إشعارات فورية عند حدوث أي تحديثات مهمة في النظام
                  </AlertDescription>
                </Alert>
                <Button onClick={handleEnableNotifications} disabled={isRequesting || isSubscribing}>
                  <Bell className="ml-2 h-4 w-4" />
                  تفعيل الإشعارات الفورية
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">الإشعارات الفورية مفعّلة</p>
                      <p className="text-sm text-muted-foreground">
                        سيتم إرسال التنبيهات إلى هذا الجهاز
                      </p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={() => unsubscribe()}>
                  إلغاء الاشتراك
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog لإعداد 2FA */}
        <Dialog open={!!twoFactorSetup} onOpenChange={() => setTwoFactorSetup(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                إعداد المصادقة الثنائية
              </DialogTitle>
              <DialogDescription>
                اتبع الخطوات التالية لإكمال الإعداد
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>1. امسح رمز QR</Label>
                <div className="p-4 bg-white rounded-lg border">
                  <div className="text-center space-y-2">
                    <QrCode className="h-32 w-32 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      استخدم تطبيق Google Authenticator أو Authy
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>2. أو أدخل المفتاح يدوياً</Label>
                <div className="flex gap-2">
                  <Input 
                    value={twoFactorSetup?.secret || ''} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={() => copyToClipboard(twoFactorSetup?.secret || '')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>3. أدخل رمز التحقق</Label>
                <Input 
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label>أكواد احتياطية (احفظها في مكان آمن)</Label>
                <div className="p-3 bg-muted rounded-lg space-y-1 max-h-32 overflow-y-auto font-mono text-xs">
                  {twoFactorSetup?.backupCodes?.map((code: string, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span>{code}</span>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleVerify}
                disabled={isVerifying || !verificationCode}
              >
                تأكيد وتفعيل
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog لعرض الأكواد الاحتياطية */}
        <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>الأكواد الاحتياطية</DialogTitle>
              <DialogDescription>
                استخدم هذه الأكواد إذا فقدت الوصول إلى تطبيق المصادقة
              </DialogDescription>
            </DialogHeader>
            <div className="p-3 bg-muted rounded-lg space-y-1 max-h-64 overflow-y-auto font-mono text-sm">
              {twoFactorStatus?.backup_codes?.map((code: string, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{code}</span>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => copyToClipboard(code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}