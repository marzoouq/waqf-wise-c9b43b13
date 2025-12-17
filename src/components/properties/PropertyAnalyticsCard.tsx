import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Wrench, DollarSign, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PropertyData {
  name?: string;
  units?: number;
  occupied?: number;
  monthly_revenue?: number;
  revenue_type?: string; // 'شهري' | 'سنوي' | 'ربع سنوي'
}

interface PropertyAnalyticsCardProps {
  property: PropertyData;
  onAnalyzeClick: () => void;
}

export function PropertyAnalyticsCard({ property, onAnalyzeClick }: PropertyAnalyticsCardProps) {
  // حساب مؤشرات الأداء
  const occupancyRate = property.units > 0 
    ? Math.round((property.occupied / property.units) * 100) 
    : 0;
  
  // حساب العائد الشهري والسنوي بناءً على نوع الإيراد
  const rawRevenue = property.monthly_revenue || 0;
  const revenueType = property.revenue_type || 'شهري';
  
  // تحويل للمعدل الشهري الصحيح
  let monthlyRevenue: number;
  if (revenueType === 'سنوي' || revenueType === 'annual') {
    monthlyRevenue = rawRevenue / 12;
  } else if (revenueType === 'ربع سنوي' || revenueType === 'quarterly') {
    monthlyRevenue = rawRevenue / 3;
  } else {
    monthlyRevenue = rawRevenue;
  }
  
  const annualRevenue = monthlyRevenue * 12;
  
  // تقييم الأداء
  const getPerformanceStatus = () => {
    if (occupancyRate >= 90) return { label: "ممتاز", variant: "default" as const, color: "text-success" };
    if (occupancyRate >= 70) return { label: "جيد", variant: "secondary" as const, color: "text-primary" };
    if (occupancyRate >= 50) return { label: "متوسط", variant: "outline" as const, color: "text-warning" };
    return { label: "ضعيف", variant: "destructive" as const, color: "text-destructive" };
  };

  const performance = getPerformanceStatus();

  return (
    <Card className="border-s-4 border-s-primary">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{property.name}</span>
          <Badge variant={performance.variant}>{performance.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* المؤشرات الأساسية */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">معدل الإشغال</div>
            <div className={`text-2xl font-bold ${performance.color}`}>
              {occupancyRate}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">الإيراد الشهري</div>
            <div className="text-2xl font-bold">
              {monthlyRevenue.toLocaleString('ar-SA')} ر.س
            </div>
          </div>
        </div>

        {/* الإيراد السنوي */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">الإيراد السنوي المتوقع</span>
          </div>
          <span className="font-bold">{annualRevenue.toLocaleString('ar-SA')} ر.س</span>
        </div>

        {/* التنبيهات */}
        {occupancyRate < 70 && (
          <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">معدل إشغال منخفض</p>
              <p className="text-muted-foreground text-xs">يُنصح بمراجعة استراتيجية التسويق</p>
            </div>
          </div>
        )}

        {/* زر التحليل بالذكاء الاصطناعي */}
        <Button 
          className="w-full" 
          variant="outline"
          onClick={onAnalyzeClick}
        >
          <Brain className="h-4 w-4 ms-2" />
          تحليل بالذكاء الاصطناعي
        </Button>
      </CardContent>
    </Card>
  );
}