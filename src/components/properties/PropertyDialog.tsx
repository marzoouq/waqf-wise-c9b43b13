import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
  occupied: z.coerce.number().min(0, { message: "عدد الوحدات المؤجرة لا يمكن أن يكون سالباً" }),
  monthly_revenue: z.coerce
    .number()
    .min(0, { message: "الإيراد الشهري لا يمكن أن يكون سالباً" }),
  status: z.string().min(1, { message: "الحالة مطلوبة" }),
  description: z.string().optional(),
}).refine((data) => data.occupied <= data.units, {
  message: "عدد الوحدات المؤجرة لا يمكن أن يتجاوز إجمالي الوحدات",
  path: ["occupied"],
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: any;
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
      name: property?.name || "",
      type: property?.type || "",
      location: property?.location || "",
      units: property?.units || 1,
      occupied: property?.occupied || 0,
      monthly_revenue: property?.monthly_revenue || 0,
      status: property?.status || "",
      description: property?.description || "",
    },
  });

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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع العقار" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="سكني">سكني</SelectItem>
                        <SelectItem value="تجاري">تجاري</SelectItem>
                        <SelectItem value="زراعي">زراعي</SelectItem>
                        <SelectItem value="إداري">إداري</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد الوحدات *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupied"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوحدات المؤجرة *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthly_revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الإيراد الشهري (ر.س) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
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
