import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWaqfUnits, type WaqfUnit } from "@/hooks/useWaqfUnits";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface WaqfUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waqfUnit?: WaqfUnit | null;
}

export function WaqfUnitDialog({ open, onOpenChange, waqfUnit }: WaqfUnitDialogProps) {
  const { addWaqfUnit, updateWaqfUnit } = useWaqfUnits();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: waqfUnit?.name || "",
    description: waqfUnit?.description || "",
    waqf_type: waqfUnit?.waqf_type || ("عقار" as "عقار" | "نقدي" | "أسهم" | "مشروع"),
    location: waqfUnit?.location || "",
    acquisition_value: waqfUnit?.acquisition_value || 0,
    current_value: waqfUnit?.current_value || 0,
    annual_return: waqfUnit?.annual_return || 0,
    is_active: waqfUnit?.is_active !== undefined ? waqfUnit.is_active : true,
    notes: waqfUnit?.notes || "",
  });

  const [acquisitionDate, setAcquisitionDate] = useState<Date | undefined>(
    waqfUnit?.acquisition_date ? new Date(waqfUnit.acquisition_date) : undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        ...formData,
        acquisition_date: acquisitionDate ? format(acquisitionDate, "yyyy-MM-dd") : undefined,
        acquisition_value: Number(formData.acquisition_value),
        current_value: Number(formData.current_value),
        annual_return: Number(formData.annual_return),
      };

      if (waqfUnit?.id) {
        await updateWaqfUnit({ id: waqfUnit.id, ...data });
      } else {
        await addWaqfUnit(data as any);
      }

      onOpenChange(false);

      // Reset form
      setFormData({
        name: "",
        description: "",
        waqf_type: "عقار",
        location: "",
        acquisition_value: 0,
        current_value: 0,
        annual_return: 0,
        is_active: true,
        notes: "",
      });
      setAcquisitionDate(undefined);
    } catch (error) {
      console.error("Error submitting waqf unit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={waqfUnit ? "تعديل قلم وقف" : "إضافة قلم وقف جديد"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم القلم *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waqf_type">نوع الوقف *</Label>
              <Select
                value={formData.waqf_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, waqf_type: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="عقار">عقار</SelectItem>
                  <SelectItem value="نقدي">نقدي</SelectItem>
                  <SelectItem value="أسهم">أسهم</SelectItem>
                  <SelectItem value="مشروع">مشروع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">الموقع</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>تاريخ الاستحواذ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !acquisitionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {acquisitionDate ? (
                      format(acquisitionDate, "PPP", { locale: ar })
                    ) : (
                      <span>اختر التاريخ</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={acquisitionDate}
                    onSelect={setAcquisitionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="acquisition_value">قيمة الاستحواذ (ريال)</Label>
              <Input
                id="acquisition_value"
                type="number"
                min="0"
                step="0.01"
                value={formData.acquisition_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    acquisition_value: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_value">القيمة الحالية (ريال)</Label>
              <Input
                id="current_value"
                type="number"
                min="0"
                step="0.01"
                value={formData.current_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_value: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annual_return">العائد السنوي (ريال)</Label>
              <Input
                id="annual_return"
                type="number"
                min="0"
                step="0.01"
                value={formData.annual_return}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    annual_return: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
            <Label htmlFor="is_active">نشط</Label>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
            {isLoading ? "جاري الحفظ..." : waqfUnit ? "تحديث" : "إضافة"}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
