/**
 * ملخص فئات المستندات
 * يعرض ملخص مالي سريع لكل فئة من المستندات
 */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Wrench, 
  Receipt, 
  FileText, 
  Calculator, 
  Wallet,
  FileCheck,
  TrendingDown,
  TrendingUp
} from "lucide-react";

interface CategorySummary {
  type: string;
  label: string;
  count: number;
  totalAmount: number;
}

interface DocumentCategorySummaryProps {
  categories: CategorySummary[];
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  'فاتورة_خدمات': Zap,
  'صيانة': Wrench,
  'زكاة_ضرائب': Receipt,
  'تقرير_مالي': FileText,
  'خدمات_محاسبية': Calculator,
  'مصاريف_عامة': Wallet,
  'اقفال_سنوي': FileCheck,
};

const TYPE_COLORS: Record<string, string> = {
  'فاتورة_خدمات': 'bg-info/10 text-info border-info/20',
  'صيانة': 'bg-warning/10 text-warning border-warning/20',
  'زكاة_ضرائب': 'bg-success/10 text-success border-success/20',
  'تقرير_مالي': 'bg-primary/10 text-primary border-primary/20',
  'خدمات_محاسبية': 'bg-accent/10 text-accent-foreground border-accent/20',
  'مصاريف_عامة': 'bg-muted text-muted-foreground border-border',
  'اقفال_سنوي': 'bg-success/10 text-success border-success/20',
};

export function DocumentCategorySummary({ categories }: DocumentCategorySummaryProps) {
  const totalExpenses = categories.reduce((sum, cat) => sum + Math.abs(cat.totalAmount), 0);

  const formatAmount = (amount: number) => {
    return Math.abs(amount).toLocaleString("ar-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">ملخص المصروفات حسب الفئة</h3>
        <Badge variant="destructive" className="text-base px-3 py-1">
          <TrendingDown className="h-4 w-4 ms-1" />
          {formatAmount(totalExpenses)} ريال
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((category) => {
          const Icon = TYPE_ICONS[category.type] || FileText;
          const colorClass = TYPE_COLORS[category.type] || TYPE_COLORS['مصاريف_عامة'];

          return (
            <Card 
              key={category.type} 
              className={`border ${colorClass} transition-all hover:shadow-md`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{category.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.count} مستند
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-mono font-bold text-destructive">
                      {formatAmount(category.totalAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">ريال</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
