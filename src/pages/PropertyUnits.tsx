import { useState } from "react";
import { useParams } from "react-router-dom";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PropertyUnitsManagement } from "@/components/properties/PropertyUnitsManagement";
import { Building2 } from "lucide-react";

export default function PropertyUnits() {
  const { propertyId } = useParams<{ propertyId: string }>();

  if (!propertyId) {
    return (
      <MobileOptimizedLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">معرف العقار غير صحيح</p>
        </div>
      </MobileOptimizedLayout>
    );
  }

  return (
    <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="إدارة الوحدات"
        description="إدارة جميع الوحدات للعقار"
        icon={<Building2 className="h-8 w-8 text-primary" />}
      />

      <PropertyUnitsManagement propertyId={propertyId} />
    </MobileOptimizedLayout>
  );
}
