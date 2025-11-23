import { useState } from "react";
import { useProperties } from "@/hooks/useProperties";
import { usePropertyUnits } from "@/hooks/usePropertyUnits";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Home, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export function PropertyAccordionView() {
  const { properties, isLoading } = useProperties();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">لا توجد عقارات</h3>
        <p className="text-sm text-muted-foreground">لم يتم تسجيل أي عقارات بعد</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-3">
      {properties.map((property) => (
        <AccordionItem 
          key={property.id} 
          value={property.id}
          className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/30">
            <div className="flex items-center justify-between w-full text-right">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-base">{property.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{property.location}</span>
                    <span className="text-xs">•</span>
                    <span>{property.type}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mr-4">
                <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                  <Home className="h-3 w-3" />
                  {property.units} وحدة
                </Badge>
                {property.occupied > 0 && (
                  <Badge variant="default" className="whitespace-nowrap">
                    {property.occupied} مشغول
                  </Badge>
                )}
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="px-4 pb-4">
            <PropertyUnitsSection 
              propertyId={property.id} 
              propertyName={property.name}
              totalUnits={property.units}
              occupiedUnits={property.occupied}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

interface PropertyUnitsSectionProps {
  propertyId: string;
  propertyName: string;
  totalUnits: number;
  occupiedUnits: number;
}

function PropertyUnitsSection({ propertyId, propertyName, totalUnits, occupiedUnits }: PropertyUnitsSectionProps) {
  const { units, isLoading } = usePropertyUnits(propertyId);
  
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>جاري تحميل وحدات {propertyName}...</span>
        </div>
      </div>
    );
  }
  
  if (!units || units.length === 0) {
    return (
      <div className="py-8 text-center">
        <Home className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-sm text-muted-foreground">لم يتم تسجيل وحدات لـ{propertyName} بعد</p>
      </div>
    );
  }

  const availableUnits = units.filter(u => u.occupancy_status === 'شاغر').length;
  const occupiedCount = units.filter(u => u.occupancy_status === 'مشغول').length;

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-info-light to-info-light/50 border-info">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-info">{units.length}</div>
            <div className="text-xs text-info-foreground mt-1">إجمالي الوحدات</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success-light to-success-light/50 border-success">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-success">
              {occupiedCount}
            </div>
            <div className="text-xs text-success-foreground mt-1">مشغول</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning-light to-warning-light/50 border-warning">
          <CardContent className="p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-warning">
              {availableUnits}
            </div>
            <div className="text-xs text-warning-foreground mt-1">متاح</div>
          </CardContent>
        </Card>
      </div>

      {/* شبكة الوحدات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {units.map((unit) => (
          <Card key={unit.id} className="hover:shadow-md transition-all duration-200 border-l-4" 
                style={{ borderLeftColor: unit.occupancy_status === 'مشغول' ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">
                    {unit.unit_name || `وحدة ${unit.unit_number}`}
                  </span>
                </div>
                <Badge 
                  variant={unit.occupancy_status === 'مشغول' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {unit.occupancy_status}
                </Badge>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>النوع:</span>
                  <span className="font-medium text-foreground">{unit.unit_type}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>الطابق:</span>
                  <span className="font-medium text-foreground">{unit.floor_number}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>المساحة:</span>
                  <span className="font-medium text-foreground">{unit.area} م²</span>
                </div>
                {unit.rooms && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>الغرف:</span>
                    <span className="font-medium text-foreground">{unit.rooms}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">الإيجار السنوي:</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(unit.annual_rent || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
