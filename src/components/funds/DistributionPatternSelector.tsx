import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Users, Heart, Settings, Sparkles } from 'lucide-react';

interface DistributionPatternSelectorProps {
  value: 'shariah' | 'equal' | 'need_based' | 'custom' | 'hybrid';
  onChange: (value: 'shariah' | 'equal' | 'need_based' | 'custom' | 'hybrid') => void;
}

const patterns = [
  {
    value: 'shariah' as const,
    label: 'التوزيع الشرعي',
    description: 'حسب الأنصبة الشرعية (الذكر له ضعف الأنثى)',
    icon: Scale,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    recommended: true,
  },
  {
    value: 'equal' as const,
    label: 'التوزيع المتساوي',
    description: 'بالتساوي بين جميع المستفيدين',
    icon: Users,
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  {
    value: 'need_based' as const,
    label: 'التوزيع حسب الحاجة',
    description: 'بناءً على حجم الأسرة والدخل الشهري',
    icon: Heart,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    value: 'custom' as const,
    label: 'التوزيع المخصص',
    description: 'تحديد نسب يدوية لكل مستفيد',
    icon: Settings,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    value: 'hybrid' as const,
    label: 'التوزيع المختلط',
    description: 'مزيج بين التوزيع الشرعي والحاجة',
    icon: Sparkles,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950',
  },
];

export function DistributionPatternSelector({ value, onChange }: DistributionPatternSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>نمط التوزيع</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid gap-3">
          {patterns.map((pattern) => {
            const Icon = pattern.icon;
            const isSelected = value === pattern.value;

            return (
              <Card
                key={pattern.value}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'
                } ${pattern.bgColor}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={pattern.value} id={pattern.value} className="mt-1" />
                    <div className="flex-1">
                      <Label
                        htmlFor={pattern.value}
                        className="flex items-center gap-2 cursor-pointer font-semibold"
                      >
                        <Icon className={`h-4 w-4 ${pattern.color}`} />
                        {pattern.label}
                        {pattern.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            موصى به
                          </Badge>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {pattern.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}
