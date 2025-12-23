import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Calculator, Calendar, Banknote, CheckCircle2 } from "lucide-react";
import type { ContractFormValues } from "../contractSchema";

interface Props {
  form: UseFormReturn<ContractFormValues>;
  isEditing: boolean;
}

export function DurationAndAmountFields({ form, isEditing }: Props) {
  // مراقبة القيم للحسابات التلقائية
  const startDate = form.watch('start_date');
  const durationValue = form.watch('duration_value');
  const durationUnit = form.watch('duration_unit');
  const totalAmount = form.watch('total_amount');
  const paymentFrequency = form.watch('payment_frequency');

  // حسابات تلقائية بدون useEffect
  const calculations = useMemo(() => {
    if (!startDate || !durationValue || !totalAmount) {
      return null;
    }

    const durationInMonths = durationUnit === 'سنوات' ? durationValue * 12 : durationValue;
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(start.getMonth() + durationInMonths);
    
    const endDate = end.toISOString().split('T')[0];
    const monthlyRent = totalAmount / durationInMonths;
    const paymentsCount = paymentFrequency === 'شهري' ? durationInMonths : 1;

    return {
      endDate,
      monthlyRent,
      durationInMonths,
      paymentsCount,
    };
  }, [startDate, durationValue, durationUnit, totalAmount, paymentFrequency]);

  return (
    <div className="space-y-4 bg-primary/5 border border-primary/20 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
        <Calculator className="h-4 w-4" />
        معلومات العقد الأساسية
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ بداية العقد *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>مدة العقد *</FormLabel>
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="duration_value"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      placeholder="3"
                      disabled={isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration_unit"
              render={({ field }) => (
                <FormItem>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="سنوات">سنوات</SelectItem>
                      <SelectItem value="أشهر">أشهر</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            مثال: 3 سنوات أو 18 شهر
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="total_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المبلغ الإجمالي للعقد (ر.س) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  placeholder="360000"
                  disabled={isEditing}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                💡 إجمالي المبلغ لكامل مدة العقد
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="payment_frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع الدفع *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="شهري">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>دفعات شهرية</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="سنوي">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      <span>دفعة سنوية مقدماً</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                💡 شهري = دفعات متعددة، سنوي = دفعة واحدة
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="security_deposit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              التأمين (ريال) - اختياري
              <span className="text-xs text-muted-foreground me-2">
                (مبلغ يُدفع مرة واحدة عند توقيع العقد)
              </span>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                placeholder="10000"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* الحسابات التلقائية */}
      {!isEditing && calculations && (
        <div className="bg-success/10 border border-success/30 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-success-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            الحسابات التلقائية:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">تاريخ النهاية:</span>
              <p className="font-semibold text-success-foreground">
                {calculations.endDate}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">الإيجار الشهري:</span>
              <p className="font-semibold text-success-foreground">
                {calculations.monthlyRent.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ر.س
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">عدد الدفعات:</span>
              <p className="font-semibold text-success-foreground">
                {calculations.paymentsCount} دفعة
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
