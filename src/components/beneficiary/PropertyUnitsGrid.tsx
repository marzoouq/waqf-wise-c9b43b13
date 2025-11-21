import { usePropertyUnits } from "@/hooks/usePropertyUnits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Home } from "lucide-react";

export function PropertyUnitsGrid() {
  const { units, isLoading } = usePropertyUnits();

  if (isLoading) return <LoadingState message="جاري تحميل الوحدات..." />;
  
  if (!units || units.length === 0) {
    return <EmptyState icon={Home} title="لا توجد وحدات" description="لم يتم تسجيل أي وحدات بعد" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {units.map((unit) => (
        <Card key={unit.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">وحدة {unit.unit_number}</CardTitle>
              <Badge variant={unit.occupancy_status === 'مشغول' ? 'default' : 'secondary'}>
                {unit.occupancy_status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">النوع:</span>
              <span className="font-medium">{unit.unit_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الطابق:</span>
              <span className="font-medium">{unit.floor_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">المساحة:</span>
              <span className="font-medium">{unit.area} م²</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">الإيجار:</span>
              <span className="font-bold text-primary">{unit.annual_rent?.toLocaleString() || 0} ر.س/سنة</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
