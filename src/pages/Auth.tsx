import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Loader2, UserCog, Shield, Calculator, Wallet, Archive, User, Users } from 'lucide-react';
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
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

// Demo accounts for quick testing
const demoAccounts = [
  { email: 'nazer@waqf.sa', password: '123456', role: 'الناظر', icon: UserCog, color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100' },
  { email: 'admin@waqf.sa', password: '123456', role: 'المشرف', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100' },
  { email: 'accountant@waqf.sa', password: '123456', role: 'المحاسب', icon: Calculator, color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100' },
  { email: 'cashier@waqf.sa', password: '123456', role: 'أمين الصندوق', icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100' },
  { email: 'archivist@waqf.sa', password: '123456', role: 'أمين الأرشيف', icon: Archive, color: 'text-teal-600', bg: 'bg-teal-50 hover:bg-teal-100' },
  { email: 'beneficiary@waqf.sa', password: '123456', role: 'مستفيد', icon: Users, color: 'text-pink-600', bg: 'bg-pink-50 hover:bg-pink-100' },
  { email: 'user@waqf.sa', password: '123456', role: 'مستخدم', icon: User, color: 'text-gray-600', bg: 'bg-gray-50 hover:bg-gray-100' },
];

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
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
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);
    
    if (!error) {
      navigate('/', { replace: true });
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    setIsLoading(false);
    
    if (!error) {
      // Switch to sign in tab after successful signup
      signUpForm.reset();
    }
  };

  const handleQuickLogin = async (email: string, password: string, role: string) => {
    setIsLoading(true);
    toast.loading(`جاري تسجيل الدخول كـ ${role}...`);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    toast.dismiss();
    
    if (!error) {
      toast.success(`تم تسجيل الدخول بنجاح كـ ${role}`);
      navigate('/', { replace: true });
    } else {
      toast.error(`فشل تسجيل الدخول. تأكد من إنشاء الحساب أولاً.`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Demo Accounts Quick Access */}
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="text-xl">تسجيل دخول سريع - حسابات تجريبية</CardTitle>
            <CardDescription>
              اضغط على أي دور للدخول مباشرة (كلمة المرور: 123456)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <Button
                    key={account.email}
                    variant="outline"
                    className={`h-auto flex flex-col items-center gap-2 p-4 ${account.bg} border-2 transition-all`}
                    onClick={() => handleQuickLogin(account.email, account.password, account.role)}
                    disabled={isLoading}
                  >
                    <Icon className={`h-8 w-8 ${account.color}`} />
                    <span className={`text-sm font-medium ${account.color}`}>
                      {account.role}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
