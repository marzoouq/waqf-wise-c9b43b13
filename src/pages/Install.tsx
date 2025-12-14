import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Download, CheckCircle, Globe } from 'lucide-react';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <PageErrorBoundary pageName="تثبيت التطبيق">
      <main className="container max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">📱 ثبّت تطبيق الوقف</CardTitle>
          <CardDescription>
            استمتع بتجربة أفضل مع التطبيق المثبت على جهازك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="flex items-center gap-3 p-4 bg-success-light text-success rounded-lg">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">التطبيق مثبت بالفعل! 🎉</span>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Smartphone className="w-12 h-12 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">يعمل دون إنترنت</h3>
                  <p className="text-sm text-muted-foreground">
                    استخدم التطبيق حتى بدون اتصال
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Download className="w-12 h-12 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">سرعة فائقة</h3>
                  <p className="text-sm text-muted-foreground">
                    تحميل فوري وأداء ممتاز
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Globe className="w-12 h-12 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">تجربة أصلية</h3>
                  <p className="text-sm text-muted-foreground">
                    يظهر مثل التطبيقات العادية
                  </p>
                </div>
              </div>

              {deferredPrompt ? (
                <Button 
                  onClick={handleInstall}
                  size="lg"
                  className="w-full"
                >
                  <Download className="ms-2" />
                  ثبّت التطبيق الآن
                </Button>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold">طريقة التثبيت اليدوي:</h3>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">📱 على iPhone/iPad:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>افتح Safari</li>
                      <li>اضغط على زر "مشاركة" (المربع مع السهم)</li>
                      <li>اختر "إضافة إلى الشاشة الرئيسية"</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">🤖 على Android:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>افتح Chrome</li>
                      <li>اضغط على القائمة (⋮)</li>
                      <li>اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</li>
                    </ol>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </main>
    </PageErrorBoundary>
  );
};

export default Install;
