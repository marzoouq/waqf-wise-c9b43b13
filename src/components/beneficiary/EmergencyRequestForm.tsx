import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const emergencySchema = z.object({
  amount: z.coerce.number().min(1, "المبلغ مطلوب"),
  emergency_reason: z.string().min(10, "يجب ذكر سبب الفزعة بشكل تفصيلي"),
  description: z.string().min(20, "يجب إضافة وصف تفصيلي للحالة"),
});

type EmergencyFormValues = z.infer<typeof emergencySchema>;

interface EmergencyRequestFormProps {
  onSubmit: (data: EmergencyFormValues) => void;
  isLoading?: boolean;
}

export function EmergencyRequestForm({ onSubmit, isLoading }: EmergencyRequestFormProps) {
  const form = useForm<EmergencyFormValues>({
    resolver: zodResolver(emergencySchema),
    defaultValues: {
      amount: 0,
      emergency_reason: "",
      description: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          طلب فزعة طارئة
        </CardTitle>
        <CardDescription>
          قدم طلب للحصول على مساعدة طارئة في حالات الضرورة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ المطلوب (ر.س) *</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergency_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الفزعة *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="اذكر سبب الفزعة الطارئة (مرض، حادث، ظرف طارئ...)"
                      rows={3}
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
                      placeholder="أضف تفاصيل أكثر عن حالتك والظروف الطارئة"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              تقديم طلب الفزعة
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
