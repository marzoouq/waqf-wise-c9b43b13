import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface DistributionPreviewProps {
  data: any;
}

export function DistributionPreview({ data }: DistributionPreviewProps) {
  const totalAmount = 1000000; // مثال
  const deductionsTotal = Number(Object.values(data.deductions || {}).reduce((sum: number, val: any) => sum + Number(val), 0));
  const distributableAmount = totalAmount * (1 - deductionsTotal / 100);
  const beneficiariesCount = data.beneficiaries?.length || 0;
  const amountPerBeneficiary = beneficiariesCount > 0 ? distributableAmount / beneficiariesCount : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">نمط التوزيع</span>
            <Badge>{data.pattern === 'equal' ? 'متساوي' : data.pattern}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">عدد المستفيدين</span>
            <span className="font-bold">{beneficiariesCount}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">المبلغ الإجمالي</span>
            <span className="font-bold">{totalAmount.toLocaleString('ar-SA')} ريال</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">الاستقطاعات ({deductionsTotal.toFixed(1)}%)</span>
            <span className="text-red-500">
              -{Math.round((totalAmount * deductionsTotal) / 100).toLocaleString('ar-SA')} ريال
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg">
            <span className="font-semibold">المبلغ القابل للتوزيع</span>
            <span className="font-bold text-green-500">
              {distributableAmount.toLocaleString('ar-SA')} ريال
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">لكل مستفيد</span>
            <span className="font-medium">
              {amountPerBeneficiary.toLocaleString('ar-SA')} ريال
            </span>
          </div>
        </div>
      </Card>

      {/* Deductions Breakdown */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">تفصيل الاستقطاعات</h4>
        <div className="space-y-2">
          {Object.entries(data.deductions || {}).map(([key, value]: [string, any]) => {
            const numValue = Number(value);
            const amount = (totalAmount * numValue) / 100;
            const labels: Record<string, string> = {
              nazer: 'نصيب الناظر',
              reserve: 'الاحتياطي',
              development: 'التطوير',
              maintenance: 'الصيانة',
              investment: 'الاستثمار',
            };
            return (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{labels[key]} ({numValue}%)</span>
                <span>{Math.round(amount).toLocaleString('ar-SA')} ريال</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Warning */}
      <div className="p-4 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-sm">
        ملاحظة: هذه محاكاة أولية. سيتم حساب المبالغ الفعلية بناءً على البيانات الكاملة.
      </div>
    </div>
  );
}
