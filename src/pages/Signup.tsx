import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, ArrowRight, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * صفحة التسجيل - معطلة
 * التسجيل العام معطل - يتم إنشاء الحسابات فقط بواسطة الناظر أو المشرف
 */
export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4 overflow-x-hidden" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">التسجيل غير متاح</CardTitle>
          <CardDescription>
            التسجيل الذاتي معطل في هذا النظام
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>تنبيه أمني</AlertTitle>
            <AlertDescription>
              يتم إنشاء الحسابات فقط من قبل الناظر أو المشرف المسؤول عن النظام. 
              إذا كنت مستفيداً أو ورثة للوقف، يرجى التواصل مع الناظر للحصول على بيانات الدخول.
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">للحصول على حساب:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>تواصل مع ناظر الوقف</li>
              <li>سيتم إنشاء حساب لك مع الصلاحيات المناسبة</li>
              <li>ستحصل على بيانات الدخول عبر البريد الإلكتروني</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button 
            onClick={() => navigate('/login')} 
            className="w-full gap-2"
          >
            الانتقال لتسجيل الدخول
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/')} 
            className="w-full"
          >
            العودة للصفحة الرئيسية
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
