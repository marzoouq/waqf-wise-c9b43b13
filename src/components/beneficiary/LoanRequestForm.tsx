import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <FormLabel>مدة السداد *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="6">6 أشهر</SelectItem>
                    <SelectItem value="12">12 شهر</SelectItem>
                    <SelectItem value="18">18 شهر</SelectItem>
                    <SelectItem value="24">24 شهر</SelectItem>
                    <SelectItem value="36">36 شهر</SelectItem>
                    <SelectItem value="48">48 شهر</SelectItem>
                    <SelectItem value="60">60 شهر</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {loanAmount > 0 && loanTerm > 0 && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-center">
              <span className="text-muted-foreground">القسط الشهري:</span>{" "}
              <span className="text-primary font-bold text-lg">{monthlyPayment} ر.س</span>
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
                  placeholder="مشروع، زواج، تعليم، علاج..."
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
                  placeholder="تفاصيل أكثر عن الغرض وخطة السداد"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "جاري الإرسال..." : "تقديم طلب القرض"}
        </Button>
      </form>
    </Form>
  );
}
