import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRateLimit } from '@/hooks/useRateLimit';
import { useLeakedPassword } from '@/hooks/useLeakedPassword';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Loader2, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const signInSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

const signUpSchema = z.object({
  fullName: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string()
    .min(12, 'كلمة المرور يجب أن تكون 12 حرف على الأقل')
    .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير واحد على الأقل')
    .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير واحد على الأقل')
    .regex(/[0-9]/, 'يجب أن تحتوي على رقم واحد على الأقل')
    .regex(/[^A-Za-z0-9]/, 'يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%^&*)'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordWarning, setPasswordWarning] = useState<string | null>(null);
  const { signIn, signUp, user } = useAuth();
  const { checkLoginRateLimit, logLoginAttempt } = useRateLimit();
  const { checkPasswordQuick } = useLeakedPassword();
  const navigate = useNavigate();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    
    try {
      // التحقق من Rate Limiting
      const rateLimit = await checkLoginRateLimit(data.email);
      
      if (!rateLimit.allowed) {
        toast.error('تم تجاوز عدد محاولات تسجيل الدخول', {
          description: 'الرجاء المحاولة بعد 15 دقيقة'
        });
        setIsLoading(false);
        return;
      }
      
      const { error } = await signIn(data.email, data.password);
      
      // تسجيل المحاولة
      await logLoginAttempt(data.email, !error);
      
      setIsLoading(false);
      
      if (!error) {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
      toast.error('حدث خطأ غير متوقع');
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    setPasswordWarning(null);
    
    try {
      // فحص كلمة المرور المسربة
      const isLeaked = await checkPasswordQuick(data.password);
      
      if (isLeaked) {
        setPasswordWarning('⚠️ تحذير: هذه الكلمة موجودة في قواعد البيانات المسربة! يُنصح بشدة باستخدام كلمة مرور أخرى.');
        setIsLoading(false);
        
        toast.error('كلمة المرور غير آمنة', {
          description: 'الرجاء استخدام كلمة مرور أخرى لم يتم اختراقها من قبل'
        });
        return;
      }
      
      const { error } = await signUp(data.email, data.password, data.fullName);
      setIsLoading(false);
      
      if (!error) {
        // Switch to sign in tab after successful signup
        signUpForm.reset();
        setPasswordWarning(null);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setIsLoading(false);
      toast.error('حدث خطأ غير متوقع');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Main Login Card */}
        <Card className="shadow-strong">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">نظام إدارة الوقف</CardTitle>
            <CardDescription className="text-base mt-2">
              نظام شامل لإدارة الأوقاف والمستفيدين
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">البريد الإلكتروني</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="example@domain.com"
                    {...signInForm.register('email')}
                    disabled={isLoading}
                  />
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {signInForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">كلمة المرور</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    {...signInForm.register('password')}
                    disabled={isLoading}
                  />
                  {signInForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {signInForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    'تسجيل الدخول'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">الاسم الكامل</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="أحمد محمد"
                    {...signUpForm.register('fullName')}
                    disabled={isLoading}
                  />
                  {signUpForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="example@domain.com"
                    {...signUpForm.register('email')}
                    disabled={isLoading}
                  />
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">كلمة المرور</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    {...signUpForm.register('password')}
                    disabled={isLoading}
                  />
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">تأكيد كلمة المرور</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    {...signUpForm.register('confirmPassword')}
                    disabled={isLoading}
                  />
                  {signUpForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {passwordWarning && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{passwordWarning}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    'إنشاء حساب'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
