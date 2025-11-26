import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface EmptySupportStateProps {
  onRefresh?: () => void;
}

export function EmptySupportState({ onRefresh }: EmptySupportStateProps) {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTestData = async () => {
    setIsGenerating(true);
    try {
      // جلب مستفيد واحد لربط التذاكر به
      const { data: beneficiaries } = await supabase
        .from('beneficiaries')
        .select('id, full_name')
        .limit(1);

      if (!beneficiaries || beneficiaries.length === 0) {
        toast.error('يجب إضافة مستفيد واحد على الأقل أولاً');
        setIsGenerating(false);
        return;
      }

      const beneficiaryId = beneficiaries[0].id;

      // توليد أرقام تذاكر فريدة
      const timestamp = Date.now();

      // إنشاء 5 تذاكر تجريبية
      const testTickets = [
        {
          ticket_number: `TKT-${timestamp}-001`,
          subject: 'استفسار عن موعد التوزيع القادم',
          description: 'أرغب في معرفة موعد التوزيع القادم للغلة الشهرية',
          category: 'inquiry',
          priority: 'medium',
          status: 'open',
          beneficiary_id: beneficiaryId,
        },
        {
          ticket_number: `TKT-${timestamp}-002`,
          subject: 'طلب تحديث البيانات البنكية',
          description: 'أحتاج إلى تحديث رقم الآيبان الخاص بي في النظام',
          category: 'account',
          priority: 'high',
          status: 'in_progress',
          beneficiary_id: beneficiaryId,
        },
        {
          ticket_number: `TKT-${timestamp}-003`,
          subject: 'مشكلة في تسجيل الدخول',
          description: 'لا أستطيع تسجيل الدخول إلى حسابي في البوابة الإلكترونية',
          category: 'technical',
          priority: 'urgent',
          status: 'open',
          beneficiary_id: beneficiaryId,
        },
        {
          ticket_number: `TKT-${timestamp}-004`,
          subject: 'استفسار عن شروط الاستحقاق',
          description: 'هل يمكنني إضافة ابني الجديد المولود كمستفيد؟',
          category: 'inquiry',
          priority: 'low',
          status: 'resolved',
          beneficiary_id: beneficiaryId,
        },
        {
          ticket_number: `TKT-${timestamp}-005`,
          subject: 'شكوى بخصوص تأخر الدفع',
          description: 'لم يصلني الدفع المستحق لهذا الشهر حتى الآن',
          category: 'complaint',
          priority: 'high',
          status: 'waiting_customer',
          beneficiary_id: beneficiaryId,
        },
      ];

      const { error: insertError } = await supabase
        .from('support_tickets')
        .insert(testTickets);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      toast.success('تم إنشاء 5 تذاكر تجريبية بنجاح');
      onRefresh?.();
    } catch (error) {
      console.error('Error generating test data:', error);
      toast.error('حدث خطأ أثناء إنشاء البيانات التجريبية');
    } finally {
      setIsGenerating(false);
    }
  };

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
            لم يتم إنشاء أي تذاكر دعم حتى الآن. يمكنك إنشاء بيانات تجريبية للاختبار أو انتظار وصول التذاكر من المستفيدين.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              onClick={handleGenerateTestData}
              disabled={isGenerating}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {isGenerating ? 'جاري الإنشاء...' : 'إنشاء بيانات تجريبية'}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/beneficiary-support')}
              className="gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              معاينة صفحة الدعم
            </Button>
          </div>

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