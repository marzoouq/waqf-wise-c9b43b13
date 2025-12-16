import { memo } from "react";
import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProperties } from "@/hooks/property/useProperties";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/ErrorState";

interface PropertySelectorProps {
  selectedPropertyId: string;
  onSelect: (propertyId: string) => void;
}

export const PropertySelector = memo(({
  selectedPropertyId,
  onSelect,
}: PropertySelectorProps) => {
  const { properties, isLoading, error, refetch } = useProperties();

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل العقارات" message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
      <Building2 className="h-5 w-5 text-primary" />
      <div className="flex-1">
        <Select value={selectedPropertyId} onValueChange={onSelect}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="اختر العقار لعرض وحداته" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{property.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({property.type} - {property.location})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedPropertyId && (
        <span className="text-sm text-muted-foreground hidden md:block">
          {properties.find(p => p.id === selectedPropertyId)?.units || 0} وحدة
        </span>
      )}
    </div>
  );
});

PropertySelector.displayName = 'PropertySelector';
