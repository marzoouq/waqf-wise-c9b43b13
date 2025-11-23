import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { type Property } from "@/hooks/useProperties";

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
  }, [property, form]);

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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم العقار *</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: مبنى سكني - حي الملك فهد" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع العقار *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع العقار" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="سكني تجاري">سكني تجاري</SelectItem>
                        <SelectItem value="سكني">سكني</SelectItem>
                        <SelectItem value="عمارة">عمارة</SelectItem>
                        <SelectItem value="محلات تجارية">محلات تجارية</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر حالة العقار" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="مؤجر">مؤجر</SelectItem>
                        <SelectItem value="شاغر">شاغر</SelectItem>
                        <SelectItem value="مؤجر جزئياً">مؤجر جزئياً</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموقع *</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: الرياض، حي الملك فهد" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shop_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد المحلات التجارية</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apartment_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد الشقق السكنية</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد الوحدات الكلية *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      💡 الوحدات المشغولة والإيراد سيتم حسابهما تلقائياً من العقود النشطة
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أضف وصفاً للعقار (اختياري)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
