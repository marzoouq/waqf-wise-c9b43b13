import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog } from "lucide-react";

const dataUpdateSchema = z.object({
  update_type: z.string().min(1, "نوع التحديث مطلوب"),
  phone: z.string().optional(),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  address: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  iban: z.string().optional(),
  description: z.string().min(10, "يجب إضافة وصف للتغييرات المطلوبة"),
});

type DataUpdateFormValues = z.infer<typeof dataUpdateSchema>;

interface DataUpdateFormProps {
  onSubmit: (data: DataUpdateFormValues) => void;
  isLoading?: boolean;
  currentData?: {
    phone?: string;
    email?: string;
    address?: string;
    bank_name?: string;
    bank_account_number?: string;
    iban?: string;
  };
}

export function DataUpdateForm({ onSubmit, isLoading, currentData }: DataUpdateFormProps) {
  const form = useForm<DataUpdateFormValues>({
    resolver: zodResolver(dataUpdateSchema),
    defaultValues: {
      update_type: "",
      phone: currentData?.phone || "",
      email: currentData?.email || "",
      address: currentData?.address || "",
      bank_name: currentData?.bank_name || "",
      bank_account_number: currentData?.bank_account_number || "",
      iban: currentData?.iban || "",
      description: "",
    },
  });

  const updateType = form.watch("update_type");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-accent" />
          طلب تحديث البيانات
        </CardTitle>
        <CardDescription>
          قدم طلب لتحديث بياناتك الشخصية أو البنكية
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="update_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع التحديث *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع التحديث" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="معلومات_شخصية">معلومات شخصية</SelectItem>
                      <SelectItem value="معلومات_بنكية">معلومات بنكية</SelectItem>
                      <SelectItem value="عنوان">العنوان</SelectItem>
                      <SelectItem value="متعدد">تحديث متعدد</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(updateType === "معلومات_شخصية" || updateType === "متعدد") && (
              <>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الجوال الجديد</FormLabel>
                      <FormControl>
                        <Input placeholder="05xxxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني الجديد</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {(updateType === "عنوان" || updateType === "متعدد") && (
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان الجديد</FormLabel>
                    <FormControl>
                      <Textarea placeholder="المدينة، الحي، الشارع..." rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(updateType === "معلومات_بنكية" || updateType === "متعدد") && (
              <>
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم البنك الجديد</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: البنك الأهلي" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الحساب الجديد</FormLabel>
                      <FormControl>
                        <Input placeholder="رقم الحساب البنكي" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الآيبان الجديد</FormLabel>
                      <FormControl>
                        <Input placeholder="SA..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب التحديث *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="اذكر سبب التحديث وأي ملاحظات إضافية..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              تقديم طلب التحديث
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}