import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLeakedPassword } from '@/hooks/useLeakedPassword';
import { Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export const LeakedPasswordCheck = () => {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<{ isLeaked: boolean; message: string } | null>(null);
  const { checkPasswordQuick, isChecking } = useLeakedPassword();

  const handleCheck = async () => {
    if (!password || password.length < 6) {
      setResult({
        isLeaked: false,
        message: 'الرجاء إدخال كلمة مرور صحيحة (6 أحرف على الأقل)',
      });
      return;
    }

    const isLeaked = await checkPasswordQuick(password);
    setResult({
      isLeaked,
      message: isLeaked 
        ? '⚠️ تحذير: هذه الكلمة موجودة في قواعد البيانات المسربة! الرجاء تغييرها فوراً.'
        : '✅ كلمة المرور آمنة ولم يتم العثور عليها في التسريبات.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          فحص كلمات المرور المسربة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password-check">كلمة المرور للفحص</Label>
          <Input
            id="password-check"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور للتحقق منها"
          />
          <p className="text-xs text-muted-foreground">
            يتم الفحص بشكل آمن عبر Have I Been Pwned API دون إرسال كلمة المرور الفعلية
          </p>
        </div>

        <Button 
          onClick={handleCheck} 
          disabled={isChecking || !password}
          className="w-full"
        >
          {isChecking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري الفحص...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              فحص كلمة المرور
            </>
          )}
        </Button>

        {result && (
          <Alert variant={result.isLeaked ? 'destructive' : 'default'}>
            {result.isLeaked ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
