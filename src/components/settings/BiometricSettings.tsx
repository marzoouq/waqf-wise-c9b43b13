/**
 * مكون إعدادات البصمة
 * يسمح للمستخدم بتسجيل وإدارة البصمات
 */

import { useEffect } from 'react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Trash2, Smartphone, Monitor, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function BiometricSettings() {
  const {
    isSupported,
    isRegistering,
    credentials,
    hasBiometricEnabled,
    registerBiometric,
    removeCredential,
    fetchCredentials,
  } = useBiometricAuth();

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const getDeviceIcon = (deviceType: string | null) => {
    if (deviceType === 'mobile' || deviceType === 'tablet') {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            المصادقة بالبصمة
          </CardTitle>
          <CardDescription>
            تسجيل الدخول باستخدام بصمة الإصبع أو Face ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>غير مدعوم</AlertTitle>
            <AlertDescription>
              جهازك أو المتصفح لا يدعم المصادقة بالبصمة. جرب استخدام متصفح حديث مثل Chrome أو Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          المصادقة بالبصمة
          {hasBiometricEnabled && (
            <Badge variant="default" className="mr-2">
              <ShieldCheck className="h-3 w-3 ml-1" />
              مفعّلة
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          تسجيل الدخول باستخدام بصمة الإصبع أو Face ID
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* البصمات المسجلة */}
        {credentials.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">الأجهزة المسجلة:</h4>
            <div className="space-y-2">
              {credentials.map((cred) => (
                <div
                  key={cred.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(cred.device_type)}
                    <div>
                      <p className="font-medium text-sm">{cred.device_name || 'جهاز غير معروف'}</p>
                      <p className="text-xs text-muted-foreground">
                        تم التسجيل: {format(new Date(cred.created_at), 'dd MMMM yyyy', { locale: ar })}
                      </p>
                      {cred.last_used_at && (
                        <p className="text-xs text-muted-foreground">
                          آخر استخدام: {format(new Date(cred.last_used_at), 'dd MMMM yyyy HH:mm', { locale: ar })}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCredential(cred.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* زر تسجيل بصمة جديدة */}
        <Button
          onClick={() => registerBiometric()}
          disabled={isRegistering}
          className="w-full"
        >
          {isRegistering ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري التسجيل...
            </>
          ) : (
            <>
              <Fingerprint className="ml-2 h-4 w-4" />
              {hasBiometricEnabled ? 'إضافة جهاز آخر' : 'تفعيل البصمة'}
            </>
          )}
        </Button>

        {!hasBiometricEnabled && (
          <p className="text-xs text-muted-foreground text-center">
            عند التفعيل، ستتمكن من تسجيل الدخول باستخدام بصمة الإصبع أو Face ID بدلاً من كلمة المرور
          </p>
        )}
      </CardContent>
    </Card>
  );
}
