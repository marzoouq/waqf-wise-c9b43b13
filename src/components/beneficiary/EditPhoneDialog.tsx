import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { supabase } from "@/integrations/supabase/client";
import { Phone } from "lucide-react";

const phoneSchema = z.object({
  phone: z.string().min(10, "رقم الجوال يجب أن يكون 10 أرقام على الأقل").regex(/^05[0-9]{8}$/, "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام"),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

interface EditPhoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiaryId: string;
  currentPhone: string;
  onSuccess?: () => void;
}

export function EditPhoneDialog({ open, onOpenChange, beneficiaryId, currentPhone, onSuccess }: EditPhoneDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: currentPhone,
    },
  });

  const onSubmit = async (data: PhoneFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("beneficiaries")
        .update({ phone: data.phone })
        .eq("id", beneficiaryId);

      if (error) throw error;

      toast({
        title: "تم تحديث رقم الجوال",
        description: "تم تحديث رقم الجوال بنجاح",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء تحديث رقم الجوال";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            تعديل رقم الجوال
          </DialogTitle>
          <DialogDescription>
            يمكنك تعديل رقم الجوال الخاص بك مباشرة
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الجوال *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="05xxxxxxxx" 
                      {...field}
                      dir="ltr"
                      className="text-right"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading}>
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
