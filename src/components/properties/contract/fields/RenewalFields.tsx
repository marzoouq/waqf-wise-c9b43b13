import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { ContractFormValues } from "../contractSchema";

interface Props {
  form: UseFormReturn<ContractFormValues>;
}

export function RenewalFields({ form }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="is_renewable"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 space-x-reverse">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">قابل للتجديد</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="auto_renew"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 space-x-reverse">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">تجديد تلقائي</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="renewal_notice_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>أيام التنبيه</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="terms_and_conditions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>الشروط والأحكام</FormLabel>
            <FormControl>
              <Textarea {...field} rows={3} />
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
              <Textarea {...field} rows={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
