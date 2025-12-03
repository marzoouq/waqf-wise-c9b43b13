import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Smartphone, Check, X } from 'lucide-react';
import { z } from 'zod';

// ✅ مخطط التحقق من كلمة المرور القوية
const passwordSchema = z.string()
  .min(8, 'يجب أن تكون 8 أحرف على الأقل')
  .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير واحد على الأقل')
  .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير واحد على الأقل')
  .regex(/[0-9]/, 'يجب أن تحتوي على رقم واحد على الأقل');

// قائمة كلمات المرور الشائعة الممنوعة
const commonPasswords = [
  '12345678', 'password', 'qwertyui', '123456789', 'password1',
  'admin123', 'welcome1', 'letmein1', 'monkey12', 'dragon12'
];

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ حساب قوة كلمة المرور
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    
    return Math.min(100, strength);
  }, [password]);

  // ✅ متطلبات كلمة المرور
  const passwordRequirements: PasswordRequirement[] = useMemo(() => [
    { label: '8 أحرف على الأقل', met: password.length >= 8 },
    { label: 'حرف كبير (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'حرف صغير (a-z)', met: /[a-z]/.test(password) },
    { label: 'رقم (0-9)', met: /[0-9]/.test(password) },
  ], [password]);

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-destructive';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 50) return 'ضعيفة';
    if (passwordStrength < 75) return 'متوسطة';
    return 'قوية';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'خطأ',
        description: 'كلمتا المرور غير متطابقتين',
        variant: 'destructive',
      });
      return;
    }

    // ✅ التحقق من كلمة المرور باستخدام Zod
    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      toast({
        title: 'كلمة المرور ضعيفة',
        description: passwordValidation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    // ✅ التحقق من كلمات المرور الشائعة
    if (commonPasswords.includes(password.toLowerCase())) {
      toast({
        title: 'كلمة المرور شائعة جداً',
        description: 'يرجى اختيار كلمة مرور أكثر تعقيداً',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, fullName);
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: 'يمكنك الآن تسجيل الدخول',
      });
      navigate('/login');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الحساب';
      toast({
        title: 'خطأ في إنشاء الحساب',
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
          <CardTitle className="text-3xl font-bold">إنشاء حساب جديد</CardTitle>
          <CardDescription>
            أدخل بياناتك لإنشاء حساب في النظام
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="محمد أحمد"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
              
              {/* ✅ مؤشر قوة كلمة المرور */}
              {password && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">قوة كلمة المرور:</span>
                    <span className={`font-medium ${
                      passwordStrength < 50 ? 'text-destructive' : 
                      passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <Progress 
                    value={passwordStrength} 
                    className="h-2"
                  />
                  
                  {/* ✅ متطلبات كلمة المرور */}
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {passwordRequirements.map((req, index) => (
                      <div 
                        key={index}
                        className={`flex items-center gap-1 text-xs ${
                          req.met ? 'text-green-600' : 'text-muted-foreground'
                        }`}
                      >
                        {req.met ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">كلمتا المرور غير متطابقتين</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || passwordStrength < 75}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                <>
                  <UserPlus className="ml-2 h-4 w-4" />
                  إنشاء حساب
                </>
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-primary hover:underline">
                تسجيل الدخول
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link to="/install" className="text-primary hover:underline inline-flex items-center justify-center gap-1">
                <Smartphone className="h-4 w-4" />
                تثبيت التطبيق على جهازك
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      </main>
    </div>
  );
}
