import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/ui/use-toast";
import { type Property } from "@/hooks/property/useProperties";
import { UnifiedFormField, FormGrid } from "@/components/unified/UnifiedFormField";

const propertySchema = z.object({
  name: z
    .string()
    .min(3, { message: "اسم العقار يجب أن يكون 3 أحرف على الأقل" })
    .max(100, { message: "اسم العقار يجب ألا يتجاوز 100 حرف" }),
  type: z.string().min(1, { message: "نوع العقار مطلوب" }),
  location: z.string().min(1, { message: "الموقع مطلوب" }),
  units: z.coerce
    .number()
    .min(1, { message: "عدد الوحدات يجب أن يكون 1 على الأقل" }),
  status: z.string().min(1, { message: "الحالة مطلوبة" }),
  description: z.string().optional(),
  shop_count: z.coerce.number().min(0).default(0),
  apartment_count: z.coerce.number().min(0).default(0),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property;
  onSave: (data: PropertyFormValues) => void;
}

export function PropertyDialog({
  open,
  onOpenChange,
  property,
  onSave,
}: PropertyDialogProps) {
  const { toast } = useToast();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      type: "",
      location: "",
      units: 1,
      status: "",
      description: "",
      shop_count: 0,
      apartment_count: 0,
    },
  });

  // تحديث القيم عند تغيير property
  useEffect(() => {
    if (property) {
      form.reset({
        name: property.name || "",
        type: property.type || "",
        location: property.location || "",
        units: property.units || 1,
        status: property.status || "",
        description: property.description || "",
        shop_count: property.shop_count || 0,
        apartment_count: property.apartment_count || 0,
      });
    } else {
      form.reset({
        name: "",
        type: "",
        location: "",
        units: 1,
        status: "",
        description: "",
        shop_count: 0,
        apartment_count: 0,
      });
    }
  }, [property, form.reset]);

  const handleSubmit = (data: PropertyFormValues) => {
    onSave(data);
    form.reset();
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={property ? "تعديل بيانات العقار" : "إضافة عقار جديد"}
      description={property ? "قم بتعديل بيانات العقار في النموذج أدناه" : "قم بإدخال بيانات العقار في النموذج أدناه"}
      size="lg"
    >
      <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <UnifiedFormField
              control={form.control}
              name="name"
              label="اسم العقار"
              placeholder="مثال: مبنى سكني - حي الملك فهد"
              required
            />

            <FormGrid columns={2}>
              <UnifiedFormField
                control={form.control}
                name="type"
                label="نوع العقار"
                type="select"
                options={[
                  { label: "سكني تجاري", value: "سكني تجاري" },
                  { label: "سكني", value: "سكني" },
                  { label: "عمارة", value: "عمارة" },
                  { label: "محلات تجارية", value: "محلات تجارية" },
                ]}
                placeholder="اختر نوع العقار"
                required
              />

              <UnifiedFormField
                control={form.control}
                name="status"
                label="الحالة"
                type="select"
                options={[
                  { label: "مؤجر", value: "مؤجر" },
                  { label: "شاغر", value: "شاغر" },
                  { label: "مؤجر جزئياً", value: "مؤجر جزئياً" },
                ]}
                placeholder="اختر حالة العقار"
                required
              />
            </FormGrid>

            <UnifiedFormField
              control={form.control}
              name="location"
              label="الموقع"
              placeholder="مثال: الرياض، حي الملك فهد"
              required
            />

            <FormGrid columns={2}>
              <UnifiedFormField
                control={form.control}
                name="shop_count"
                label="عدد المحلات التجارية"
                type="number"
                min={0}
              />

              <UnifiedFormField
                control={form.control}
                name="apartment_count"
                label="عدد الشقق السكنية"
                type="number"
                min={0}
              />
            </FormGrid>

            <UnifiedFormField
              control={form.control}
              name="units"
              label="عدد الوحدات الكلية"
              type="number"
              min={1}
              description="💡 الوحدات المشغولة والإيراد سيتم حسابهما تلقائياً من العقود النشطة"
              required
            />

            <UnifiedFormField
              control={form.control}
              name="description"
              label="الوصف"
              type="textarea"
              placeholder="أضف وصفاً للعقار (اختياري)"
              rows={3}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit">
                {property ? "حفظ التعديلات" : "إضافة العقار"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
    </ResponsiveDialog>
  );
}
