import { useState, useEffect } from "react";
import { Link2, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  waqf_unit_id: string | null;
}

interface LinkPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waqfUnitId: string;
  onSuccess?: () => void;
}

export function LinkPropertyDialog({
  open,
  onOpenChange,
  waqfUnitId,
  onSuccess,
}: LinkPropertyDialogProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUnlinkedProperties();
    }
  }, [open]);

  const fetchUnlinkedProperties = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, location, type, waqf_unit_id")
        .is("waqf_unit_id", null);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("فشل في جلب العقارات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPropertyId) {
      toast.error("الرجاء اختيار عقار");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("properties")
        .update({ waqf_unit_id: waqfUnitId })
        .eq("id", selectedPropertyId);

      if (error) throw error;

      toast.success("تم ربط العقار بنجاح");
      onOpenChange(false);
      setSelectedPropertyId("");
      onSuccess?.();
    } catch (error) {
      console.error("Error linking property:", error);
      toast.error("فشل في ربط العقار");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            ربط عقار بقلم الوقف
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="property">اختر العقار</Label>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                جاري التحميل...
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-4 border rounded-md bg-muted/50">
                <Building2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  جميع العقارات مرتبطة بأقلام وقف
                </p>
              </div>
            ) : (
              <Select
                value={selectedPropertyId}
                onValueChange={setSelectedPropertyId}
              >
                <SelectTrigger id="property">
                  <SelectValue placeholder="اختر عقار للربط" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      <div className="flex flex-col">
                        <span>{property.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {property.location} - {property.type}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPropertyId || isSaving}
            className="gap-2"
          >
            {isSaving ? "جاري الحفظ..." : "ربط العقار"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
