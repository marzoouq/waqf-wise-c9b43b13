import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function EmptySupportState() {
  const navigate = useNavigate();

  return (
    <Card className="border-dashed border-2">
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            لا توجد تذاكر دعم فني بعد
          </h3>
          
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            لم يتم إنشاء أي تذاكر دعم حتى الآن. ستظهر هنا عند وصول التذاكر من المستفيدين.
          </p>

          <Button
            variant="outline"
            onClick={() => navigate('/beneficiary-support')}
            className="gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            معاينة صفحة الدعم
          </Button>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-right max-w-md mx-auto">
            <p className="font-medium mb-2">💡 نصيحة:</p>
            <p className="text-muted-foreground">
              سيتمكن المستفيدون من إرسال تذاكر الدعم من خلال صفحة "الدعم الفني" في بوابتهم الإلكترونية.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
