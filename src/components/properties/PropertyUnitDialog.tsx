import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  unit_number: z.string().min(1, "رقم الوحدة مطلوب"),
  unit_name: z.string().optional(),
  unit_type: z.string().min(1, "نوع الوحدة مطلوب"),
  floor_number: z.coerce.number().optional(),
  area: z.coerce.number().optional(),
  rooms: z.coerce.number().min(0, "عدد الغرف يجب أن يكون رقماً موجباً"),
  bathrooms: z.coerce.number().min(0, "عدد دورات المياه يجب أن يكون رقماً موجباً"),
  has_kitchen: z.boolean().default(true),
  has_parking: z.boolean().default(false),
  parking_spaces: z.coerce.number().min(0).default(0),
  monthly_rent: z.coerce.number().optional(),
  status: z.string().default("متاح"),
  occupancy_status: z.string().default("شاغر"),
  description: z.string().optional(),
  notes: z.string().optional(),
});

interface PropertyUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  unit?: any;
}

export function PropertyUnitDialog({
  open,
  onOpenChange,
  propertyId,
  unit,
}: PropertyUnitDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: unit ? {
      unit_number: unit.unit_number,
      unit_name: unit.unit_name || "",
      unit_type: unit.unit_type,
      floor_number: unit.floor_number || undefined,
      area: unit.area || undefined,
      rooms: unit.rooms,
      bathrooms: unit.bathrooms,
      has_kitchen: unit.has_kitchen,
      has_parking: unit.has_parking,
      parking_spaces: unit.parking_spaces,
      monthly_rent: unit.monthly_rent || undefined,
      status: unit.status,
      occupancy_status: unit.occupancy_status,
      description: unit.description || "",
      notes: unit.notes || "",
    } : {
      unit_number: "",
      unit_name: "",
      unit_type: "شقة",
      rooms: 2,
      bathrooms: 1,
      has_kitchen: true,
      has_parking: false,
      parking_spaces: 0,
      status: "متاح",
      occupancy_status: "شاغر",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const data: any = {
        property_id: propertyId,
        unit_number: values.unit_number,
        unit_name: values.unit_name || null,
        unit_type: values.unit_type,
        floor_number: values.floor_number || null,
        area: values.area || null,
        rooms: values.rooms,
        bathrooms: values.bathrooms,
        has_kitchen: values.has_kitchen,
        has_parking: values.has_parking,
        parking_spaces: values.parking_spaces,
        monthly_rent: values.monthly_rent || null,
        status: values.status,
        occupancy_status: values.occupancy_status,
        description: values.description || null,
        notes: values.notes || null,
      };

      if (unit) {
        const { error } = await supabase
          .from("property_units")
          .update(data)
          .eq("id", unit.id);

        if (error) throw error;
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث بيانات الوحدة",
        });
      } else {
        const { error } = await supabase
          .from("property_units")
          .insert([data]);

        if (error) throw error;
        toast({
          title: "تمت الإضافة بنجاح",
          description: "تم إضافة الوحدة الجديدة",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["property-units", propertyId] });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {unit ? "تعديل وحدة" : "إضافة وحدة جديدة"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الوحدة *</FormLabel>
                    <FormControl>
                      <Input placeholder="101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الوحدة</FormLabel>
                    <FormControl>
                      <Input placeholder="شقة الطابق الأول" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الوحدة *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="شقة">شقة</SelectItem>
                        <SelectItem value="فيلا">فيلا</SelectItem>
                        <SelectItem value="محل">محل تجاري</SelectItem>
                        <SelectItem value="مكتب">مكتب</SelectItem>
                        <SelectItem value="مستودع">مستودع</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floor_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الطابق</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المساحة (م²)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد الغرف *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد دورات المياه *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthly_rent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الإيجار الشهري (ر.س)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حالة الوحدة *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="متاح">متاح</SelectItem>
                        <SelectItem value="مشغول">مشغول</SelectItem>
                        <SelectItem value="صيانة">صيانة</SelectItem>
                        <SelectItem value="غير متاح">غير متاح</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupancy_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حالة الإشغال *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="شاغر">شاغر</SelectItem>
                        <SelectItem value="مشغول">مشغول</SelectItem>
                        <SelectItem value="محجوز">محجوز</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="has_kitchen"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>يوجد مطبخ</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="has_parking"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>يوجد موقف</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("has_parking") && (
                <FormField
                  control={form.control}
                  name="parking_spaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عدد المواقف</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="وصف تفصيلي للوحدة..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ملاحظات إضافية..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الحفظ..." : unit ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
