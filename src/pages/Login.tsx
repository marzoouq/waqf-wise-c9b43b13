import { useState } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from "@/lib/toast";
import { Loader2, LogIn, Smartphone, Fingerprint } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'staff' | 'beneficiary'>('staff');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const { isSupported: isBiometricSupported, isAuthenticating, authenticateWithBiometric } = useBiometricAuth();

  // محاولة تسجيل الدخول بالبصمة - التوجيه عبر RoleBasedRedirect
  const handleBiometricLogin = async () => {
    const result = await authenticateWithBiometric();
    if (result.success) {
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'مرحباً بك في منصة إدارة الوقف',
      });
      // التوجيه للصفحة الوسيطة التي ستحدد لوحة التحكم المناسبة
      navigate('/redirect');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (loginType === 'beneficiary') {
        // تسجيل دخول المستفيد برقم الهوية
        const { data, error: rpcError } = await supabase
          .rpc('get_beneficiary_email_by_national_id', { 
            p_national_id: identifier 
          });

        if (rpcError) {
          productionLogger.error('RPC Error:', rpcError);
          throw new Error('حدث خطأ في البحث عن رقم الهوية');
        }

        if (!data || data.length === 0) {
          throw new Error('رقم الهوية غير مسجل في النظام أو ليس لديه حساب دخول. يرجى التواصل مع الإدارة');
        }

        const beneficiary = data[0];
        
        // تسجيل الدخول بالبريد الإلكتروني المرتبط
        await signIn(beneficiary.email, password);
      } else {
        // تسجيل دخول الموظفين بالبريد الإلكتروني
        await signIn(identifier, password);
      }

      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'مرحباً بك في منصة إدارة الوقف',
      });
      // التوجيه للصفحة الوسيطة التي ستحدد لوحة التحكم المناسبة
      navigate('/redirect');
    } catch (error) {
      // تحليل نوع الخطأ وعرض رسالة مناسبة
      let errorTitle = 'خطأ في تسجيل الدخول';
      let errorMessage = 'البيانات المدخلة غير صحيحة';
      
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes('invalid_credentials') || msg.includes('invalid login credentials')) {
          errorTitle = 'بيانات الدخول غير صحيحة';
          errorMessage = loginType === 'beneficiary' 
            ? 'رقم الهوية أو كلمة المرور غير صحيحة. تأكد من البيانات وحاول مرة أخرى'
            : 'البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من البيانات وحاول مرة أخرى';
        } else if (msg.includes('email not confirmed')) {
          errorTitle = 'البريد الإلكتروني غير مؤكد';
          errorMessage = 'يرجى تأكيد بريدك الإلكتروني أولاً من خلال الرابط المرسل إليك';
        } else if (msg.includes('too many requests') || msg.includes('rate limit')) {
          errorTitle = 'محاولات كثيرة';
          errorMessage = 'لقد قمت بمحاولات كثيرة. يرجى الانتظار قليلاً ثم المحاولة مجدداً';
        } else if (msg.includes('network') || msg.includes('fetch')) {
          errorTitle = 'خطأ في الاتصال';
          errorMessage = 'تأكد من اتصالك بالإنترنت وحاول مرة أخرى';
        } else if (msg.includes('session') || msg.includes('expired') || msg.includes('bad_jwt')) {
          errorTitle = 'انتهت الجلسة';
          errorMessage = 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى';
          // تنظيف localStorage عند أخطاء الجلسة
          const keysToClean = Object.keys(localStorage).filter(key => 
            key.includes('supabase') || key.includes('sb-')
          );
          keysToClean.forEach(key => localStorage.removeItem(key));
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <main>
        <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription>
            اختر نوع الحساب وأدخل بياناتك للدخول إلى النظام
          </CardDescription>
        </CardHeader>
        
        <Tabs value={loginType} onValueChange={(v) => setLoginType(v as 'staff' | 'beneficiary')} className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="staff">الموظفون</TabsTrigger>
            <TabsTrigger value="beneficiary">المستفيدون</TabsTrigger>
          </TabsList>
          
          <TabsContent value="staff">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 px-0">
                <div className="space-y-2">
                  <Label htmlFor="staff-email">البريد الإلكتروني</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    placeholder="example@waqf.sa"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-password">كلمة المرور</Label>
                  <Input
                    id="staff-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 px-0">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <LogIn className="ml-2 h-4 w-4" />
                      تسجيل الدخول
                    </>
                  )}
                </Button>
                
                {isBiometricSupported && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleBiometricLogin}
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري التحقق...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="ml-2 h-4 w-4" />
                        الدخول بالبصمة
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="beneficiary">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 px-0">
                <div className="space-y-2">
                  <Label htmlFor="national-id">رقم الهوية الوطنية</Label>
                  <Input
                    id="national-id"
                    type="text"
                    placeholder="1014548273"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={isLoading}
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                  <p className="text-xs text-muted-foreground">
                    أدخل رقم الهوية الوطنية المسجل في النظام
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beneficiary-password">كلمة المرور</Label>
                  <Input
                    id="beneficiary-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 px-0">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <LogIn className="ml-2 h-4 w-4" />
                      تسجيل الدخول
                    </>
                  )}
                </Button>
                
                {isBiometricSupported && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleBiometricLogin}
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري التحقق...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="ml-2 h-4 w-4" />
                        الدخول بالبصمة
                      </>
                    )}
                  </Button>
                )}
                
                <div className="text-center text-xs text-muted-foreground">
                  إذا كنت مستفيداً جديداً، يرجى التواصل مع الإدارة لإنشاء حساب
                </div>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
        <div className="text-center text-sm text-muted-foreground px-6 pb-4">
          <Link to="/install" className="text-primary hover:underline inline-flex items-center justify-center gap-1">
            <Smartphone className="h-4 w-4" />
            تثبيت التطبيق على جهازك
          </Link>
        </div>
      </Card>
      </main>
    </div>
  );
}
