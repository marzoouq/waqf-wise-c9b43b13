import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BeneficiaryService } from "@/services";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QUERY_KEYS } from "@/lib/query-keys";

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
      await BeneficiaryService.update(beneficiaryId, { email: values.email });

      toast({
        title: "تم بنجاح",
        description: "تم تحديث البريد الإلكتروني بنجاح",
      });

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY_STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY(beneficiaryId) });
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "فشل تحديث البريد الإلكتروني";
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
