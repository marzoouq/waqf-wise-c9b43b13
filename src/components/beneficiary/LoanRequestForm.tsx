import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

const loanSchema = z.object({
  loan_amount: z.coerce.number().min(1000, "المبلغ يجب أن يكون 1000 ريال على الأقل"),
  loan_term_months: z.coerce.number().min(6, "المدة يجب أن تكون 6 أشهر على الأقل").max(60, "المدة القصوى 60 شهراً"),
  loan_reason: z.string().min(20, "يجب ذكر سبب القرض بشكل تفصيلي"),
  description: z.string().min(20, "يجب إضافة وصف تفصيلي"),
});

type LoanFormValues = z.infer<typeof loanSchema>;

interface LoanRequestFormProps {
  onSubmit: (data: LoanFormValues) => void;
  isLoading?: boolean;
}

export function LoanRequestForm({ onSubmit, isLoading }: LoanRequestFormProps) {
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      loan_amount: 5000,
      loan_term_months: 12,
      loan_reason: "",
      description: "",
    },
  });

  const loanAmount = form.watch("loan_amount");
  const loanTerm = form.watch("loan_term_months");
  const monthlyPayment = loanTerm > 0 ? (loanAmount / loanTerm).toFixed(2) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-500" />
          طلب قرض
        </CardTitle>
        <CardDescription>
          قدم طلب للحصول على قرض من الوقف
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="loan_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مبلغ القرض (ر.س) *</FormLabel>
                  <FormControl>
                    <Input type="number" min="1000" step="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loan_term_months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مدة السداد (بالأشهر) *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المدة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="6">6 أشهر</SelectItem>
                      <SelectItem value="12">12 شهر</SelectItem>
                      <SelectItem value="18">18 شهر</SelectItem>
                      <SelectItem value="24">24 شهر (سنتان)</SelectItem>
                      <SelectItem value="36">36 شهر (3 سنوات)</SelectItem>
                      <SelectItem value="48">48 شهر (4 سنوات)</SelectItem>
                      <SelectItem value="60">60 شهر (5 سنوات)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {loanAmount > 0 && loanTerm > 0 && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <span className="font-semibold">القسط الشهري المتوقع:</span>{" "}
                  <span className="text-primary font-bold">{monthlyPayment} ر.س</span>
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="loan_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب طلب القرض *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="اذكر سبب احتياجك للقرض (مشروع، زواج، تعليم، علاج...)"
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
                      placeholder="أضف تفاصيل أكثر عن الغرض من القرض وخطة السداد"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              تقديم طلب القرض
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
