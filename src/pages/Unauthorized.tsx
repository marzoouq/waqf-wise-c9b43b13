import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">غير مصرح بالوصول</CardTitle>
          <CardDescription>
            عذراً، ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-center text-muted-foreground">
            إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مدير النظام
          </p>
          <Button asChild className="w-full">
            <Link to="/dashboard">
              العودة للوحة التحكم
              <ArrowRight className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
