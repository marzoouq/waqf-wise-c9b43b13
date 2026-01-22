import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import type { DeductionsValues } from '@/types/distributions';

interface DeductionsConfigProps {
  values: DeductionsValues;
  onChange: (values: DeductionsValues) => void;
}

export function DeductionsConfig({ values, onChange }: DeductionsConfigProps) {
  const updateValue = (key: string, value: number) => {
    onChange({ ...values, [key]: value });
  };

  const total = Object.values(values).reduce((sum, val) => sum + val, 0);
  const remaining = 100 - total;

  const deductions = [
    { key: 'nazer', label: 'نصيب الناظر' },
    { key: 'reserve', label: 'الاحتياطي' },
    { key: 'development', label: 'التطوير' },
    { key: 'maintenance', label: 'الصيانة' },
    { key: 'investment', label: 'الاستثمار' },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">إجمالي الاستقطاعات</span>
          <span className={`text-2xl font-bold ${remaining < 0 ? 'text-destructive' : 'text-success'}`}>
            {total}%
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          المتبقي للتوزيع: {remaining}%
        </div>
      </Card>

      <div className="space-y-4">
        {deductions.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={key}>{label}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id={key}
                  type="number"
                  min="0"
                  max="100"
                  value={values[key as keyof typeof values]}
                  onChange={(e) => updateValue(key, Number(e.target.value))}
                  className="w-20 text-center"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <Slider
              value={[values[key as keyof typeof values]]}
              onValueChange={([value]) => updateValue(key, value)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {remaining < 0 && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          تحذير: مجموع النسب يتجاوز 100%. يرجى تعديل القيم.
        </div>
      )}
    </div>
  );
}
