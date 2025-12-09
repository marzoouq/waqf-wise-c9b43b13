import { useState } from "react";
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
import { useUnlinkedProperties, useLinkProperty } from "@/hooks/waqf/useWaqfProperties";

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
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  
  const { data: properties = [], isLoading } = useUnlinkedProperties();
  const linkProperty = useLinkProperty();

  const handleSubmit = async () => {
    if (!selectedPropertyId) return;

    linkProperty.mutate(
      { propertyId: selectedPropertyId, waqfUnitId },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedPropertyId("");
          onSuccess?.();
        },
      }
    );
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
            disabled={!selectedPropertyId || linkProperty.isPending}
            className="gap-2"
          >
            {linkProperty.isPending ? "جاري الحفظ..." : "ربط العقار"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
