import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";
import { getUnitTypeLabel } from "@/lib/constants";

type PropertyUnit = Database['public']['Tables']['property_units']['Row'];

interface Props {
  units: PropertyUnit[] | undefined;
  selectedUnits: string[];
  onToggleUnit: (unitId: string) => void;
  isLoading: boolean;
}

export function ContractUnitsSelector({ units, selectedUnits, onToggleUnit, isLoading }: Props) {
  const availableUnits = units?.filter(u => u.status === 'متاح') || [];

  return (
    <div className="space-y-3 border border-border rounded-lg p-4">
      <Label className="text-base font-semibold">الوحدات المتاحة للتأجير *</Label>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">جاري تحميل الوحدات...</p>
      ) : availableUnits.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p>لا توجد وحدات متاحة في هذا العقار</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {availableUnits.map((unit) => (
            <div
              key={unit.id}
              className={`flex items-start space-x-2 space-x-reverse p-3 rounded-lg border transition-colors cursor-pointer ${
                selectedUnits.includes(unit.id)
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-muted border-border'
              }`}
              onClick={() => onToggleUnit(unit.id)}
            >
              <Checkbox
                checked={selectedUnits.includes(unit.id)}
                onCheckedChange={() => onToggleUnit(unit.id)}
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{unit.unit_name}</p>
                <p className="text-xs text-muted-foreground">{unit.unit_number}</p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">{getUnitTypeLabel(unit.unit_type)}</Badge>
                  {unit.floor_number && <Badge variant="secondary" className="text-xs">طابق {unit.floor_number}</Badge>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedUnits.length > 0 && (
        <p className="text-sm text-muted-foreground">
          تم اختيار {selectedUnits.length} وحدة
        </p>
      )}
    </div>
  );
}
