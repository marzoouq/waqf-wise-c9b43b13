import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const emailSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface EditEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiaryId: string;
  currentEmail: string;
}

export function EditEmailDialog({
  open,
  onOpenChange,
  beneficiaryId,
  currentEmail,
}: EditEmailDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: currentEmail,
    },
  });

  const onSubmit = async (values: EmailFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("beneficiaries")
        .update({ email: values.email })
        .eq("id", beneficiaryId);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تحديث البريد الإلكتروني بنجاح",
      });

      queryClient.invalidateQueries({ queryKey: ["beneficiary-profile"] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل تحديث البريد الإلكتروني",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل البريد الإلكتروني</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="example@email.com"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
