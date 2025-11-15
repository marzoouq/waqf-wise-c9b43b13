import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { commonValidation } from "@/lib/validationSchemas";

const addFamilyMemberSchema = z.object({
  member_name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  relationship: z.string().min(1, "نوع القرابة مطلوب"),
  national_id: z.string().min(10, "رقم الهوية يجب أن يكون 10 أرقام"),
  date_of_birth: commonValidation.dateString("تاريخ الميلاد غير صحيح"),
  gender: z.string().min(1, "الجنس مطلوب"),
  reason: z.string().min(10, "يجب ذكر سبب الإضافة"),
  description: z.string().min(20, "يجب إضافة وصف تفصيلي"),
});

type AddFamilyMemberFormValues = z.infer<typeof addFamilyMemberSchema>;

interface AddFamilyMemberFormProps {
  onSubmit: (data: AddFamilyMemberFormValues) => void;
  isLoading?: boolean;
}

export function AddFamilyMemberForm({ onSubmit, isLoading }: AddFamilyMemberFormProps) {
  const form = useForm<AddFamilyMemberFormValues>({
    resolver: zodResolver(addFamilyMemberSchema),
    defaultValues: {
      member_name: "",
      relationship: "",
      national_id: "",
      date_of_birth: "",
      gender: "",
      reason: "",
      description: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-success" />
          طلب إضافة فرد للعائلة
        </CardTitle>
        <CardDescription>
          قدم طلب لإضافة فرد جديد من العائلة (مولود جديد، زوجة جديدة، إلخ)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="member_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الفرد الجديد *</FormLabel>
                  <FormControl>
                    <Input placeholder="الاسم الكامل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القرابة *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر القرابة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ابن">ابن</SelectItem>
                        <SelectItem value="ابنة">ابنة</SelectItem>
                        <SelectItem value="زوجة">زوجة</SelectItem>
                        <SelectItem value="أخ">أخ</SelectItem>
                        <SelectItem value="أخت">أخت</SelectItem>
                        <SelectItem value="أب">أب</SelectItem>
                        <SelectItem value="أم">أم</SelectItem>
                        <SelectItem value="آخر">آخر</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الجنس *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الجنس" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ذكر">ذكر</SelectItem>
                        <SelectItem value="أنثى">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="national_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهوية *</FormLabel>
                  <FormControl>
                    <Input placeholder="1xxxxxxxxx" maxLength={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ الميلاد *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الإضافة *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="مثال: مولود جديد، زواج جديد، إلخ..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تفاصيل إضافية *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أضف أي تفاصيل إضافية مهمة..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-3 bg-muted rounded-md text-sm">
              <p className="font-semibold mb-1">المستندات المطلوبة:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>صورة من شهادة الميلاد (للمواليد الجدد)</li>
                <li>صورة من الهوية الوطنية</li>
                <li>صورة من عقد الزواج (للزوجات)</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              تقديم طلب الإضافة
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}