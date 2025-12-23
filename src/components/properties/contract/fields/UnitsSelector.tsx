import { UseFormReturn, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form";
import { getUnitTypeLabel } from "@/lib/constants";
import { usePropertyUnits } from "@/hooks/property/usePropertyUnits";
import type { ContractFormValues } from "../contractSchema";
import type { Database } from "@/integrations/supabase/types";

type PropertyUnit = Database['public']['Tables']['property_units']['Row'];

interface Props {
  form: UseFormReturn<ContractFormValues>;
}

export function UnitsSelector({ form }: Props) {
  const propertyId = form.watch('property_id');
  const { units, isLoading } = usePropertyUnits(propertyId);
  
  const availableUnits = units?.filter(u => u.status === 'متاح') || [];

  if (!propertyId) {
    return null;
  }

  return (
    <Controller
      name="unit_ids"
      control={form.control}
      render={({ field, fieldState }) => (
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
              {availableUnits.map((unit) => {
                const isSelected = field.value.includes(unit.id);
                
                return (
                  <label
                    key={unit.id}
                    htmlFor={`unit-${unit.id}`}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted border-border'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`unit-${unit.id}`}
                      checked={isSelected}
                      onChange={(e) => {
                        const newValue = e.target.checked
                          ? [...field.value, unit.id]
                          : field.value.filter(id => id !== unit.id);
                        field.onChange(newValue);
                      }}
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{unit.unit_name}</p>
                      <p className="text-xs text-muted-foreground">{unit.unit_number}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {getUnitTypeLabel(unit.unit_type)}
                        </Badge>
                        {unit.floor_number && (
                          <Badge variant="secondary" className="text-xs">
                            طابق {unit.floor_number}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
          
          {field.value.length > 0 && (
            <p className="text-sm text-muted-foreground">
              تم اختيار {field.value.length} وحدة
            </p>
          )}
          
          {fieldState.error && (
            <p className="text-sm font-medium text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
